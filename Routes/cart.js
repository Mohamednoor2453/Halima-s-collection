const express = require('express')

const router= express.Router()

const Cart = require('../model/cart.js')
const Product = require('../model/product.js')
// const isAuthenticated = require('../middleware/authMiddleware.js');
const auth = require('./auth.js')

// const User = require('../model/user.js')//user model 

//Add to cart functionality

router.post('/addcart', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        // Checking if the user has a cart
        let cart = await Cart.findOne({ userId });

        // If no cart exists, create one
        if (!cart) {
            cart = new Cart({
                userId,
                items: [],
                totalItem: 0,
                cartTotalPrice: 0
            });
        }

        // Check if the product exists in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({ message: 'Product is not yet available' });
        }

        // Check if the product already exists in the cart
        const existProductIndex = cart.items.findIndex(
            item => item.productId.toString() === productId.toString()
        );

        // If product exists, update its quantity and total price
        if (existProductIndex > -1) {
            cart.items[existProductIndex].quantity += quantity;
            cart.items[existProductIndex].totalPrice =
                cart.items[existProductIndex].quantity * product.price;
        } else {
            // Product is not in the cart, add it as a new item
            cart.items.push({
                productId: product._id, // Make sure to use the correct product ID
                quantity: quantity,
                price: product.price,
                totalPrice: quantity * product.price
            });
        }

        // Recalculating total items and the cart's total price
        cart.totalItem = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.cartTotalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Save the updated cart to the database
        await cart.save();

        res.status(200).json({ message: "Product added to cart successfully", cart });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//Removing specific Item from cart

router.delete('/removefrom_cart', async (req, res) => {
    const { userId, productId } = req.body; // Extracting userId and productId from the request body

    try {
        //  Finding the cart linked to the user
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(400).json({ message: "Cart does not exist" });
        }

        //  Finding the index of the item to be removed
        let itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        //  Checking if the item exists in the cart
        if (itemIndex === -1) {
            return res.status(400).json({ message: "Item not found in the cart" });
        }

        //  Removing the item if it exists
        cart.items.splice(itemIndex, 1);

        // Recalculating total items and total price in the cart
        cart.totalItem = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.cartTotalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Saving the updated cart
        await cart.save();

        res.status(200).json({ message: "Item removed from cart successfully", cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//view cart

router.get('/view_cart', isAuthenticated, async(req, res)=>{
    const{userId}= req.query
    try {
        let cart = await Cart.findOne({userId})

        if(!cart){
            return res.status(400).json({message: 'cart has not been created'})
        }

        res.status(200).render('viewCart', {cart})

    } catch (error) {
        res.status(500).json({error: error.message})
        
    }
})


//clearing cart

// Clearing the entire cart from the database
router.delete('/clear_cart', async (req, res) => {
    const { userId } = req.query;

    try {
        // Attempt to delete the cart linked to the user
        const result = await Cart.deleteOne({ userId });

        // Check if the cart was found and deleted
        if (result.deletedCount === 0) {
            return res.status(400).json({ message: 'Cart not found' });
        }

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router