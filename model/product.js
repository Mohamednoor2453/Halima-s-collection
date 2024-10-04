const mongoose = require('mongoose')
const  Schema = mongoose.Schema;

const productSchema = new Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number,
    categories: String,
    images: [String],
 
}, { timestamps: true });

const Product= mongoose.model('Product', productSchema);

module.exports = Product;