// route.js

const express = require('express');
const path = require('path');

const router = express.Router();
router.use(express.static('public'));

// Sending home page to user
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Sending admin page to user
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Sending add products page to user
router.get('/addingProducts', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/addproducts.html'));
});

router.get('/addedProducts', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/allproducts.html'));
});
module.exports = router;
