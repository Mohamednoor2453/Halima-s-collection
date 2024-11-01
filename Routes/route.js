
const express = require('express');
const path = require('path');
const Product = require('../model/product.js');
const router = express.Router();
// Import authentication middleware
const isAuthenticated = require('../middleware/authMiddleware.js');
router.use(express.static('public'));

// Sending home page to user
router.get('/', (req, res) => {
    res.render('index');
});

// Sending admin page to user
router.get('/admin', isAuthenticated,(req, res) => {
    res.render('admin', { title: 'Home' });
});

// Sending add products page to user
router.get('/addingProducts', isAuthenticated,(req, res) => {
    res.render('addproducts.ejs');
});

// Sending all products page to user
router.get('/admin/addedProducts', isAuthenticated, async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 }).limit(6);
        res.render('allproducts', { products: products, title: 'Products' });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).render('error', { message: "Internal Server Error", error: error.message });
    }
});




module.exports = router;
