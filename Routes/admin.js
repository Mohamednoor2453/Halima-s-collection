require('dotenv').config();

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

// Set up multer for image uploads with file type validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Folder to store images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Save files with unique names
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error("Only image files allowed"), false);
    }
};

// Handle file upload errors
const upload = multer({ storage: storage, fileFilter: fileFilter }).array('images', 5);
const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError || err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
};

// Serve the uploads folder for accessing images
router.use('/uploads', express.static(uploadDir));

// CORS middleware to handle requests from different origins
router.use((req, res, next) => {
    const allowedOrigins = process.env.CORS_ORIGIN || '*';
    res.header("Access-Control-Allow-Origin", allowedOrigins);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// POST new product with image uploads
router.post('/admin/addingProducts', uploadMiddleware, async (req, res) => {
    try {
        const { name, description, price, stock, categories } = req.body;
        const images = req.files.map(file => `/uploads/${file.filename}`);

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            categories,
            images
        });

        await newProduct.save();
        console.log('Product added successfully');
        res.status(201).redirect('/admin/addedProducts'); // Changed status to 201 for creation
    } catch (error) {
        console.error("Error adding product:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET all added products
// GET route to fetch and display all products
router.get('/admin/addedProducts', async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 }).limit(6); // Fetch all products from the database
        res.render('allproducts', { title: 'All Products', products });
    } catch (error) {
        console.error("Error fetching products:", error.message);
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

        // Remove images associated with the product
        product.images.forEach(imagePath => {
            const fullPath = path.join(__dirname, '..', imagePath);
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error(`Error deleting the image at ${fullPath}`, err);
                }
            });
        });

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT (Update) a product by ID
router.put('/admin/updateProduct/:id', uploadMiddleware, async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, stock, categories } = req.body;

    try {
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        const updatedImages = newImages.length > 0 ? newImages : existingProduct.images;

        if (newImages.length > 0) {
            // Remove old images if new ones are uploaded
            existingProduct.images.forEach(imagePath => {
                const fullPath = path.join(__dirname, '..', imagePath);
                fs.unlink(fullPath, (err) => {
                    if (err) console.error(`Error deleting old image at ${fullPath}`, err);
                });
            });
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                name,
                description,
                price,
                stock,
                categories,
                images: updatedImages
            },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;