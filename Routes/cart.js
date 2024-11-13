const express = require('express')

const router= express.Router()

const Cart = require('../model/cart.js')
const Product = require('../model/product.js')
const isAuthenticated = require('../middleware/authMiddleware.js');

// const User = require('../model/user.js')//user model 


//Add to cart functionality

router.post('/addcart', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        // checking if user has a cart
        let cart = await Cart.findOne({ userId });

        // if no cart exists, create one
        if (!cart) {
            cart = new Cart({
                userId,
                items: [], // Initialize items as an empty array
                totalItem: 0,
                cartTotalPrice: 0
            });
        }

        // checking if product exists in Db
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({ message: 'Product is not yet available' });
        }

        // checking if product exists in the cart
        const existProductIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());

        // if product exists, update its quantity and total price
        if (existProductIndex > -1) {
            cart.items[existProductIndex].quantity += quantity;
            cart.items[existProductIndex].totalPrice += quantity * product.price;
        } else {
            // Product is not in the cart, add it as a new item
            cart.items.push({
                productId: productId,
                quantity: quantity,
                price: product.price,
                totalPrice: quantity * product.price
            });
        }

        // Recalculating total items in the cart and its price
        cart.totalItem = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.cartTotalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        await cart.save(); // Save the updated cart to the database

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

router.get('/view_cart',  async(req, res)=>{
    const userId = '672bb1a085c63c7a27657810';

    if (!userId) {
        return res.status(400).json({ message: 'User not authenticated' });
    }

    try {
        let cart = await Cart.findOne({ userId }).populate('items.productId');

        if(!cart){
            return res.status(400).json({message: 'cart has not been created'})
        }

        res.status(200).render('viewcart', {cart})

    } catch (error) {
        res.status(500).json({error: error.message})
        
    }
})


//clearing cart

router.delete('/clear_cart',  async(req, res)=>{
    const userId= '672bb1a085c63c7a27657810'

    try {
        let cart = await Cart.findOne({userId})

        if(!cart){
            return res.status(400).json({message: 'cart not found'})
        }

        //clearing cart

        cart.items = [];
        cart.totalPrice = 0;
        cart.totalItem = 0;

        await cart.save()

        res.status(200).json({message: 'cart cleared successfully', cart})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})


module.exports = router