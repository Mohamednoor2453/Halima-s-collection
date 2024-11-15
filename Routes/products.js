const express = require('express');
const mongoose = require('mongoose');
const Product = require('../model/product.js');

const router = express.Router();

// Helper function to get products by category
const getProductsByCategory = async (category, limit = 6) => {
    return await Product.find({ categories: category }).sort({ _id: -1 }).limit(limit);
};

// Route for men's products
router.get('/mensproducts', async (req, res) => {
    try {
        const tshirts = await getProductsByCategory('men-tshirt');
        const trousers = await getProductsByCategory('men-trousers');
        const shoes = await getProductsByCategory('men-shoes');
        const suits = await getProductsByCategory('suits');

        res.status(200).render('mensproducts', { title: 'Mens Products', tshirts, trousers, shoes, suits });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route for women's products
router.get('/womensproducts', async (req, res) => {
    try {
        const shoes = await getProductsByCategory('women-shoes');
        const trousers = await getProductsByCategory('women-trousers');
        const clothing = await getProductsByCategory('women-clothing')

        res.status(200).render('womensproducts', { title: "Women's Products", shoes, trousers, clothing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route for sneakers
router.get('/sneakers', async (req, res) => {
    try {
        const sneakers = await getProductsByCategory('sneakers', 15);

        res.status(200).render('sneakers', { title: 'Sneakers', sneakers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route for accessories
router.get('/accessories', async (req, res) => {
    try {
        const accessories = await getProductsByCategory('accessories');

        res.status(200).render('accessories', { title: 'Accessories', accessories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.get('/:category/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.render('addcart', { product });
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search products by category and other filters
router.get('/search', async (req, res) => {
    try {
        const { name, category, minPrice, maxPrice } = req.query;
        const query = {};

        // Build query based on provided filters
        if (name) query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
        if (category) query.categories = { $regex: category, $options: 'i' }; // Case-insensitive category search
        if (minPrice) query.price = { $gte: Number(minPrice) };
        if (maxPrice) query.price = { $lte: Number(maxPrice) };

        const products = await Product.find(query).sort({ _id: -1 }).limit(6);

        // Pass the products to the 'searchResults' template
        res.status(200).render('search', { 
            title: 'Search Results', 
            products 
        });
    } catch (err) {
        res.status(500).json({ message: 'Error occurred while searching for products', error: err.message });
    }
});

module.exports = router;
