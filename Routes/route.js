const express = require('express');
const path = require('path');

const router = express.Router();
router.use(express.static('public'));

// Sending home page to user
router.get('/', (req, res) => {
    res.redirect('admin', { title: 'Home' })
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
router.get('/addedProducts', (req, res) => {
    res.render('allproducts', { title: 'Products' });
});

module.exports = router;
