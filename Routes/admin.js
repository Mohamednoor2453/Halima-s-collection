const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Product = require('../model/product.js');

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Folder to store images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Save files with unique names
    }
});
const upload = multer({ storage: storage });

// Serving the uploads folder
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// POST new product with image uploads
router.post('/admin/addingProducts', upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, stock, categories } = req.body;
        const images = req.files.map(file => `/uploads/${file.filename}`); // Save relative paths to images

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            categories,
            images
        });

        await newProduct.save();
        res.sendFile(path.join(__dirname, '../public/allproducts.html'));
    } catch (error) {
        console.error("Error adding product:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET all added products
router.get('/admin/addedProducts', async (req, res) => {
    try {
        const products = await Product.find();
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: "No products available yet" });
        }
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE a product by ID
router.delete('/admin/deletingProducts/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT (Update) a product by ID
router.put('/admin/updateProduct/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, stock, categories, images } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                name,
                description,
                price,
                stock,
                categories,
                images,
            },
            { new: true } // Return the updated product after update
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
