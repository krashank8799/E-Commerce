var mongoose = require("mongoose");

const url = "YOUR MONGODB URL"

module.exports.start = function() {
    mongoose.connect(url).then(function() {
        console.log("Database is working using mongoose")
    });

}
