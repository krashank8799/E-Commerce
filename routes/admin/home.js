const express = require("express");
const router = express.Router();
const multer = require('multer')
const app = express()
app.use(express.json())


const productModel = require('./database/modules/addproducts')

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
app.use(express.urlencoded());

router.get("/", function(req, res) {
    console.log("Admin Login")
    var admin = req.session.admin;
    console.log(admin);
    res.render('admin/adminhome.ejs', { user: admin.username });
})

router.route("/addproduct").post(upload.single("productimage"), function(req, res) {
    var productName = req.body.productname;
    var productDes = req.body.productdescription;
    var productPrice = req.body.productprice;
    var productStock = req.body.productstock;
    var productImage = req.file.filename;

    var product = {
            name: productName,
            price: productPrice,
            description: productDes,
            filename: productImage,
            stock: productStock
        }
        //console.log(product);

    addProductsToDB(product, function(err, data) {
        if (data) {
            console.log("Products added in database successfully")
            res.redirect("/admin");
        } else {
            res.end("Error While adding Products in Databse")
        }
    })
}).get(function(req, res) {
    getProductsFromDB(function(products) {
        //console.log(products);
        res.json(products);
    })
}).put(function(req, res) {
    productModel.updateOne({ _id: req.body.id }, {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        stock: req.body.stock
    }).then(function(data) {
        if (data) {
            res.end("Updated");
            console.log("Updated Sucessfully")
        }
    })
})

router.post("/deleteproduct", function(req, res) {
    console.log(req.body.id)
    var proid = req.body.id;
    productModel.deleteOne({ _id: proid }).then(function() {
        console.log("deleted")
    })
})

function addProductsToDB(product, callback) {
    productModel.create(product).then(function(data) {
        console.log("saved")
        callback(null, data)
    }).catch(function(err) {
        callback(err, null)
    })
}

function getProductsFromDB(callback) {
    productModel.find({}).then(function(products) {
        callback(products);
    })
}


module.exports = router;