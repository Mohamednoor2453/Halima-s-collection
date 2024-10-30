const express = require('express');
const path = require('path');
const Product = require('../model/product.js');
const router = express.Router();
router.use(express.static('public'));

// Sending home page to user
router.get('/', (req, res) => {
    res.redirect('admin', { title: 'Home' });
});

// Sending admin page to user
router.get('/admin', (req, res) => {
    res.render('admin', { title: 'Home' });
});

// Sending add products page to user
router.get('/addingProducts', (req, res) => {
    res.render('addproducts.ejs');
});

// Sending all products page to user
router.get('/admin/addedProducts', async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 }).limit(6);
        res.render('allproducts', { products: products, title: 'Products' });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).render('error', { message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
