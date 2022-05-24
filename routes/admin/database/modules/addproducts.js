const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    price: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true,
    },

    filename: {
        type: String,
        required: true
    },

    stock: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const productModel = mongoose.model('product', productSchema);

module.exports = productModel;