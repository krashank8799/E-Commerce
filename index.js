const db = require("./database/index")
const userModelInstance = require("./database/models/user")

const userModel = userModelInstance.model;
const userTypeEnums = userModelInstance.userRoleEnums;

const cartModel = require("./database/models/cart")
const sendMail = require("./utils/verifyemail")
var passwordValidator = require('password-validator');
const express = require('express')
const multer = require('multer')
var session = require('express-session')
const fs = require("fs")
const app = express()
app.use(express.json())
app.use(express.urlencoded())

const bcrypt = require('bcrypt');
const saltRounds = 10;




const productModel = require("./routes/admin/database/modules/addproducts")

var validationSchema = new passwordValidator();

validationSchema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(1)
    .has().symbols(1)

db.start();

const port = 3000

app.use(express.static("uploads"))
app.use(express.static("public"))
app.use(express.static("product_images"))



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })


app.set('view engine', 'ejs');
app.set("views", "views")


app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: true,
}))


app.route('/').get(function(req, res) {
        var user = null;

        if (req.session.isLoggedIn) {
            user = req.session.user
        }

        productModel.find({}).then(function(products) {
            res.render("welcome.ejs", { user: user, products: products, count: 0 });
        })

        /*fs.readFile("products.js" , "UTF-8" , function(err,data)
        {
        	res.render("welcome.ejs" , {user : user, products : JSON.parse(data) , id:0});
        })*/
    })
    /*.post(function(req, res)
    {
    	var id = req.body.id;
    	var user = null;

    	if(req.session.isLoggedIn)
    	{
    		user= req.session.user;
    	}

    	fs.readFile("products.js" , "UTF-8" , function(err,data)
    		{
    			res.render("welcome.ejs" , {user : user, products : JSON.parse(data) , id:id});
    		})
    })*/

app.post("/loadmore", function(req, res) {
    var count = req.body.count;
    var user = req.session.user;
    productModel.find({}).then(function(products) {
        res.render("welcome.ejs", { user: user, products: products, count: JSON.parse(count) });
    })
})

app.get("/home", function(req, res) {
    res.render("home");
})

app.get("/signup", function(req, res) {
    res.render("signup.ejs")
})

app.get("/login", function(req, res) {
    res.render("login.ejs", { errorMsg: "" })
})

app.post("/savedetails", upload.single("profilepic"), function(req, res) {
    var username = req.body.username
    var email = req.body.email
    var password = req.body.password
    var number = req.body.number
    var pic = req.file

    if (!username || !password || !email || !number || !pic) {
        res.render("error.ejs", { errorMsg: "Please fill the details" })
        return;
    } else {
        bcrypt.hash(password, saltRounds).then(function(hash) {
            var details = {
                username: username,
                email: email,
                password: hash,
                number: number,
                pic: pic.filename,
                isVerified: false,
                userType: userTypeEnums.customer
            }
            saveUserDetails(details, password, function(err, data) {
                if (err) {
                    if (err.code === 11000) {
                        res.render("error.ejs", { errorMsg: "Email Exist!" })
                    } else if (err.code === 127000) {
                        res.render("error.ejs", { errorMsg: "Password should contain atleast 1 uppercase,1 lowercase,1 numeric and 1 special character" });
                    }
                } else {
                    var dbId = data._id;
                    console.log(dbId);

                    var url = '<a href= "https://localhost:3000/verifyuser/' + dbId + '">Click here for verification</a>'
                    console.log(email)
                    sendMail(email,
                        "Welcome!!",
                        "Please click on the hyperlink below to verify",
                        url,
                        function(err) {
                            if (err) {
                                res.render("error.ejs", { errorMsg: "Error While Verification!" })
                            } else {
                                console.log(details);
                                console.log("Details Saved Successfully");
                                res.status(200);
                                res.render("message.ejs", { msg: "Please Check Your Email for verification link " })
                            }
                        })
                }
            })
        })
    }
})

app.get("/verifyuser/:dbId", function(req, res) {
    const dbId = req.params.dbId;
    var verified = true;

    userModel.updateOne({ _id: dbId }, { isVerified: verified }).then(function(data) {
        if (data) {
            console.log(data);
            res.redirect("/login")
            res.end("User Verified")
        } else {
            res.render("error.ejs", { errorMsg: "Verification Failed!!" })
        }
    })
})

app.route("/adminlogin").get(function(req, res) {
    res.render("admin/adminlogin.ejs")
}).post(function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    userLogin(email, password, function(data) {
        if (data) {
            if (data.isVerified) {
                if (data.userType === userTypeEnums.admin) {
                    req.session.isLoggedIn = true;
                    req.session.admin = data;
                    console.log(data);
                    req.session.isAdmin = true;
                    res.redirect("/admin")
                } else {
                    res.render("error.ejs", { errorMsg: "You are not allowed to Login from here" })
                }
            } else {
                res.render("error.ejs", { errorMsg: "Please Sign Up first" })
            }
        } else {
            res.render("error.ejs", { errorMsg: "Email Not Exist or check your credentials" })

        }
    })
})

app.use("/admin", function(req, res, next) {
    if (req.session.isLoggedIn && req.session.isAdmin) {
        console.log("admin")
        var admin = req.session.admin;
        console.log(admin)

        if (admin.userType === userTypeEnums.admin) {
            next();
        } else {
            res.render("error.ejs", { errorMsg: "Prohibited Area" })
        }
    } else {
        res.redirect("/login")
    }
})

app.post("/userlogin", function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    userLogin(email, password, function(data) {
        if (data == null) {
            res.render("error.ejs", { errorMsg: "Invalid Id or Password" })
                //console.log(err);
        } else if (data == 11000) {
            res.render("error.ejs", { errorMsg: "Please login from admin panel" })

        } else {
            console.log("login")
            var isVerified = data.isVerified;
            console.log(isVerified);
            if (isVerified) {
                if (data.userType == userTypeEnums.customer) {
                    req.session.isLoggedIn = true;
                    req.session.user = data;
                    res.redirect("/");
                } else {
                    res.render("error.ejs", { errorMsg: "Please Login From Admin Page" })
                }
            } else {
                res.render("error.ejs", { errorMsg: "Please verify User First!!" })
            }
        }
    })
})

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
})

app.post("/showdetails", function(req, res) {
    var productId = req.body.id;
    console.log(productId);

    productModel.findOne({ _id: productId }).then(function(product) {
            if (req.session.isLoggedIn) {
                res.render("product.ejs", { product: product, user: req.session.user });
            } else {
                res.render("product.ejs", { product: product, user: "" });
            }
        })
        /*fs.readFile("products.js" , "utf-8" , function(err ,data)
        {
        	var products = JSON.parse(data);

        	var user = null;

        	if(req.session.isLoggedIn)
        	{
        		user = req.session.user;
        	}

        	/*for(var i =0 ;i<products.length ; i++)
        	{
        		if(products[i].id==productId)
        		{
        			console.log(products[i]);
        			res.render("product.ejs",{product:products[i],name:req.session.user.username,pic:req.session.user.pic});
        		}
        	}*/

    /*	products.forEach(function(product)
    	{
    		if(product.id==productId)
    		{
    			res.render("product.ejs",{product:product, user:user});
    		}
    	})
    })*/
})

app.get("/forgetPassword", function(req, res) {
    res.render("forgetpassword.ejs")
})

app.post("/forget", function(req, res) {
    var email = req.body.email;
    req.session.email = email;

    userModel.findOne({ email: email }).then(function(data) {
        var userId = data._id;
        console.log(userId)
        var isVerified = data.isVerified

        if (isVerified) {
            //Send OTP
            console.log("user verified")
            var otp = Math.floor(Math.random() * (999999 - 100000) + 100000);
            req.session.otp = otp;
            console.log(otp);

            var url = '<h1>Your OTP is - ' + otp +
                '<a href= "http://localhost:3000/verifyotp/' + userId + '"> Reset Password</a>'

            sendMail(email,
                "Forget Password!!",
                "otp",
                url,
                function(err) {
                    if (err) {
                        res.render("error.ejs", { errorMsg: "Error While Reseting Password!" })
                    } else {
                        console.log("OTP sent Successfully");
                        res.status(200);
                        res.render("message.ejs", { msg: "We have sent an OTP to your Mail Please Check Your Mail" })

                    }
                })
        }
    }).catch(function() {
        res.render("error.ejs", { errorMsg: "Invalid Email" })
    })
})

app.get("/verifyotp/:userId", function(req, res) {
    var userId = req.params.userId;

    res.render("reset.ejs", { userId: userId, errorMsg: "" });
})

app.post("/passwordreset", function(req, res) {
    var userOtp = req.body.otp;
    var newpassword = req.body.password;
    var otp = req.session.otp;
    var userId = req.body.userId;
    var email = req.session.email;

    console.log(userOtp);
    console.log(otp);

    if (validationSchema.validate(newpassword)) {
        if (userOtp == otp) {
            bcrypt.hash(newpassword, saltRounds).then(function(hash) {
                userModel.updateOne({ _id: userId }, { password: hash }).then(function(data) {
                    console.log(data);
                    res.render("login.ejs", { errorMsg: "" });

                    sendMail(email,
                        "Password Changed",
                        "Password Changed Successfully",
                        "",
                        function(err) {
                            if (err) {
                                res.render("error.ejs", { errorMsg: "Error While Reseting Password!" })
                            } else {
                                console.log("Password Changed Successfully");
                                res.status(200);
                            }
                        })
                })
            })
        } else {
            res.render("reset.ejs", { userId: "", errorMsg: "Wrong OTP" })
        }

    } else {
        res.render("reset.ejs", { userId: "", errorMsg: "Password should contain atleast 1 uppercase,1 lowercase,1 numeric and 1 special character" });
    }
})

app.get("/account", function(req, res) {
    var user = req.session.user;
    console.log(user);
    res.render("account.ejs", { username: user.username, email: user.email, mobileNo: user.number });
})

app.post("/changeaccountdetails", function(req, res) {
    res.render("changepassword.ejs", { errorMsg: "" })
})

app.post("/changepassword", function(req, res) {
    var user = req.session.user;
    console.log(user._id)
    var newpassword = req.body.newpassword;
    var confirmpassword = req.body.confirmpassword;

    if (validationSchema.validate(newpassword)) {
        if (newpassword == confirmpassword) {
            bcrypt.hash(newpassword, saltRounds).then(function(hash) {
                userModel.updateOne({ _id: user._id }, { password: hash }).then(function(data) {
                    console.log("Password changed succefully");

                    sendMail(user.email,
                        "Password Changed",
                        "Password Changed Successfully",
                        "",
                        function(err) {
                            if (err) {
                                res.render("error.ejs", { errorMsg: "Error While changing Password!" })
                            } else {
                                console.log("Password Changed Successfully");
                                res.redirect("/")
                                res.status(200);
                            }
                        })
                }).catch(function(err) {
                    if (err) {
                        res.render("error.ejs", { errorMsg: "Password not changed" })
                    }
                })
            })
        } else {
            res.render("changepassword.ejs", { errorMsg: "Password Missmatch" });
        }
    } else {
        res.render("changepassword.ejs", { errorMsg: "Password should contain atleast 1 uppercase,1 lowercase,1 numeric and 1 special character" });
    }
})

app.post("/addtocart", function(req, res) {
    //var user =null;

    if (req.session.isLoggedIn) {
        var productName = req.body.productName;
        var productPrice = req.body.productPrice;
        var productImage = req.body.productImage;
        var productId = req.body.productId;
        var userId = req.session.user._id;

        var productDetails = {
            productId: productId,
            userId: userId,
            productName: productName,
            productPrice: productPrice,
            productImg: productImage
        }

        cartModel.findOne({ userId: userId, productId: productId }).then(function(product) {
            if (product) {
                res.send("Already in Cart");
            } else {
                addToCart(productDetails, function() {
                    res.send("200");
                    console.log("Added in Cart")
                })
            }
        })
    } else {
        res.end("401")
    }



    //var productId = req.body.id;
    //var userId = user._id

    //console.log(productId);

    /*fs.readFile("products.js" , "UTF-8" , function(err,data)
    {
    	var products = JSON.parse(data);

    	products.forEach(function(product)
    	{
    		if(product.id == productId)
    		{
    			var productName = product.name;
    			var productPrice = product.price;
    			var productImg = product.filename;
    			var productDes = product.description;
    			console.log("products Found")

    			var productsAdded = 
    			{
    				userId : userId,
    				productId : productId,
    				productName : productName,
    				productImg : productImg,
    				productPrice : productPrice,
    				productDes : productDes 
    			}

    			addToCart(productsAdded , function()
    			{
    				res.status(200);
    				console.log("Successfully added to cart")
    			})
    		}
    		/*else
    		{
    			console.log("invalid product id")
    		}
    	})
    })*/
})

app.get("/mycart", function(req, res) {
    if (req.session.isLoggedIn) {
        var user = req.session.user;
        console.log(user)

        res.render("mycart.ejs", { username: user.username });
    } else {
        console.log("sadfdg")
        res.redirect("/login")
    }

})

app.get("/cartproducts", function(req, res) {
    var user = req.session.user;
    var userId = user._id;
    console.log(userId);

    getAllProducts(userId, function(products) {
        console.log(products);
        res.json(products);
    })
})

app.post("/removefromcart", function(req, res) {
    var productId = req.body.id;
    var userId = req.session.user._id;

    console.log(productId);
    console.log(userId);


    cartModel.deleteOne({ userId: userId, productId: productId }).then(function(err) {
        if (err) {
            console.log(err);
        }
    })
})

app.post("/quantityupdate", function(req, res) {
    var productId = req.body.id;
    var userId = req.session.user._id;
    var updatedQuantity = req.body.quantity;

    checkProductInCart(productId, function(product) {
        console.log(product.stock)
        if (product.stock >= updatedQuantity) {
            cartModel.updateOne({ productId: productId, userId: userId }, { quantity: updatedQuantity }).then(function() {
                res.end("200")
                console.log("Quantity Updated In Database")
            }).catch(function(err) {
                console.log(err);
            })
        } else {
            res.json("401")
        }
    })

})

function saveUserDetails(details, password, callback) {
    if (validationSchema.validate(password)) {
        userModel.create(details).then(function(data) {
            callback(null, data);
        }).catch(function(err) {
            if (err) {
                console.log(err)
                callback(err);
            }
        })
    } else {
        var err = { code: 127000 };
        callback(err);
    }
}

function userLogin(email, password, callback) {
    userModel.findOne({ email: email }).then(function(data) {
            if (data != null) {
                bcrypt.compare(password, data.password).then(function(result) {
                    if (result) {
                        console.log(data);
                        callback(data);
                    } else {
                        console.log("wrong password")
                        callback(null)
                    }
                })

            } else {
                let errorCode = 11000;
                callback(errorCode)
            }
        })
        /*.catch(function(err)
        	{
        		if(err)
        		{
        			console.log(err);
        			callback(err,null);
        		}
        	})*/
}

function addToCart(addedProducts, callback) {
    cartModel.create(addedProducts).then(function() {
        callback();
    }).catch(function(err) {
        console.log(err);
    })
}

function getAllProducts(userId, callback) {
    cartModel.find({ userId: userId }).then(function(products) {
        console.log(products);
        callback(products);
    }).catch(function(err) {
        console.log(err);
    })
}

function checkProductInCart(productId, callback) {
    console.log(productId);
    productModel.findOne({ _id: productId }).then(function(products) {
        console.log(products);
        callback(products)
    }).catch(function(err) {
        if (err) {
            console.log(err);
        }
    })
}


const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes.home)

app.listen(port, function() {
    console.log(`Example app listening at http://localhost:${port}`)
})