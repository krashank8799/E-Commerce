var mongoose = require("mongoose");

const url = "mongodb+srv://Krashank:k12345678@cluster0.7moxc.mongodb.net/E-Commerce?retryWrites=true&w=majority"

module.exports.start = function() {
    mongoose.connect(url).then(function() {
        console.log("Database is working using mongoose")
    });

}