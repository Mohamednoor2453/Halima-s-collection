require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Product = require('../model/product.js');
const isAuthenticated = require('../middleware/authMiddleware.js');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage }).array('images', 5);

// Middleware for file upload errors
const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
};

//adding new product
router.post('/addingProducts', uploadMiddleware, async (req, res) => {
    try {
        const { name, description, price, stock, categories } = req.body;

        // Check if files are uploaded
        if (!req.files || req.files.length === 0) {
            throw new Error("No images uploaded");
        }

        // Function to upload images using a stream
        const uploadImage = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'products', resource_type: 'image', use_filename: true, unique_filename: true },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                stream.end(fileBuffer);
            });
        };

        // Upload images to Cloudinary
        const imageUploads = req.files.map(file => uploadImage(file.buffer));
        const images = await Promise.all(imageUploads);

        // Create and save the new product
        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            categories,
            images,
        });

        await newProduct.save();
        console.log('Product added successfully');
        res.status(201).redirect('/admin/addedProducts');
    } catch (error) {
        console.error("Error adding product:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});





// GET all added products
// GET route to fetch and display all products
router.get('/admin/addedProducts', isAuthenticated, async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 }).limit(4); // Fetch all products from the database
        res.render('allproducts', { title: 'All Products', products });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

 // Add this route in admin.js
router.get('/addedProducts/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.render('detail', { product });
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});


// DELETE a product by ID
router.delete('/admin/deletingProducts/:id', isAuthenticated, async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Delete images from Cloudinary
        product.images.forEach(async (imageUrl) => {
            const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log(`Deleted image: ${imageUrl}`);
            } catch (err) {
                console.error(`Error deleting image from Cloudinary: ${err.message}`);
            }
        });

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// Route to get product details for updating
router.get('/updateProduct/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.render('update', { product });
    } catch (error) {
        console.error("Error fetching product for update:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT (Update) a product by ID
router.put('/admin/updateProduct/:id', isAuthenticated, uploadMiddleware, async (req, res) => {
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

        res.redirect('/admin/addedProducts');
        } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;