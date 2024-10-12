const express = require('express')

router = express.Router()
const Product = require('../model/product.js')


//posting a new product

router.post('/admin/addingProduts', async(req, res)=>{
    try {
        const {name, description, price, stock, categories, images} = req.body //add all this small letters

        const newProduct = await new Product({
            name, description, price, stock, categories, images
        })

        newProduct.save()
        res.status(201).json({success: true, message: "product added successfully"})
    } catch (error) {
        res.status(500).json({success: false, error: error})
        
    }
})

//sending the product added to admin page

//add new product and view in all products

router.get('/admin/addedProducts', async(req, res)=>{

    try {
        const products = await Product.find()
        if(products.length === 0){
            return res.status(404).json({success: false, message: "Products are not yet available"})
        }
        res.status(200).json({ success: true, products });

    } catch (error) {
        res.status(500).json({succsess: false, error: error.message})
        
    }
})


//deleting product

router.delete('/admin/deletingProducts/:id', async(req, res)=>{

    const productId = req.params.id

    try {

        const product = await Product.findById(productId)

        if(!product){
            return res.status(400).json({success:false, message: "product are not yet available"})
        }

        await Product.findByIdAndDelete(productId)

        res.status(200).json({success:true, message: "Product deleted successfully"})
        
    } catch (error) {

        res.status(500).json({success: false, error: error.message})
        
    }
})


//Updating a product

router.put('/admin/updateProduct/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, stock, categories, images } = req.body;

    try {
        // Find the product by ID and update it
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
            { new: true } // This option returns the updated product after the update
        );

        if (!updatedProduct) {
            // If the product is not found, send a 404 response
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Send the updated product as the response
        res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        // Handle server errors
        res.status(500).json({ success: false, error: error.message });
    }
});







module.exports = router