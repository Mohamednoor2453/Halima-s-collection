const express = require('express')
const mongoose = require('mongoose')
const Product = require('../model/product.js')

const router = express.Router()


// Fetch limited products for homepage display
router.get('/homepage-products', async (req, res) => {
    try {
        // Fetch a limited number of products, e.g., 6
        const products = await Product.find().limit(6); 
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search products by category
router.get('/search', async (req, res) => {
    try {
        // Get query parameters
        const { name, category, minPrice, maxPrice } = req.query;
        const query = {};

        // Build query based on provided filters
        if (name) query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
        if (category) query.categories = { $regex: category, $options: 'i' }; // Case-insensitive category search
        if (minPrice) query.price = { $gte: Number(minPrice) };
        if (maxPrice) query.price = { $lte: Number(maxPrice) };

        const products = await Product.find(query);
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error occurred while searching for products', error: err });
    }
});

module.exports = router