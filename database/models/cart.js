const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    productId: {
        type: String,
        required: true
    },

    productName: {
        type: String,
        required: true
    },

    productPrice: {
        type: String,
        required: true
    },

    productImg: {
        type: String,
        required: true
    },

    productDes: {
        type: String,
        default: ""
    },

    quantity: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

const cartModel = mongoose.model('cart', cartSchema);

module.exports = cartModel;