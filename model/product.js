const mongoose = require('mongoose')
const  Schema = mongoose.Schema;


const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true,
        min: 0 // Ensure price is not negative
    },
    stock: {
        type: Number,
        required: true,
        min: 0 // Ensure stock is not negative
    },
    categories: {
        type: String,
        required: true
    },
    images: [String]
}, { timestamps: true });

const Product= mongoose.model('Product', productSchema);

module.exports = Product;