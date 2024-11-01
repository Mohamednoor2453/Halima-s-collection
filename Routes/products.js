const express = require('express')
const mongoose = require('mongoose')
const Product = require('../model/product.js')

const router = express.Router()



router.get('/mensproducts', async (req, res) => {
    try {
        const tshirts = await Product.find({ categories: 'men-tshirt' }).sort({ _id: -1 }).limit(6);
        const trousers = await Product.find({ categories: 'men-trousers' }).sort({ _id: -1 }).limit(6);
        const shoes = await Product.find({ categories: 'men-shoes' }).sort({ _id: -1 }).limit(6);
        const suits = await Product.find({ categories: 'suits' }).sort({ _id: -1 }).limit(6);

        res.status(200).render('mensproducts', { title: 'Men’s Products', tshirts, trousers, shoes, suits });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//fetching womens product and displaying them on womensproducts page

router.get('/womensprouducts', async(req, res)=>{
    try {
        const shoes = await Product.find({categories: 'women-shoes'}).sort({_id: -1}).limit(6);
        const clothings = await Product.find({categories: 'women-trousers'}).sort({_id: -1}).limit(6);

        res.status(200).render('womensproducts', {title: "women's products", shoes, clothings})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

//fetching sneaker and diplaying them on sneakers page
router.get('/sneakers', async(req, res)=>{
    try {
        const sneakers = await Product.find({categories: 'sneakers'}).sort({_id: -1}).limit(6);

        res.status(200).render('sneakers', {title: 'sneakers', sneakers})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

//fetching accessories and displaying them on accessories page

router.get('/accessories', async(req, res)=>{
    try {
        const acccessories = await Product.find({categories: "accessories"}).sort({_id: -1}).limit(6)
        res.status(200).render('accessories', {title: 'accessories', acccessories})
    } catch (error) {
        
    }
})



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