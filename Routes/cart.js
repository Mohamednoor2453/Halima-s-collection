const express = require('express')

const router= express.Router()

const Cart = require('../model/cart.js')
const Product = require('../model/product.js')
const isAuthenticated = require('../middleware/authMiddleware.js');
const auth = require('./auth.js')

const User = require('../model/user.js')//user model 


//Add to cart functionality

// cart.js

router.post('/addcart', isAuthenticated, async (req, res) => {
    const { productId, quantity } = req.body;

    // Ensure session and user data are defined
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Session not found. Please log in again.' });
    }

    const userId = req.session.user.userId;

    try {
        // Find or create cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({
                userId,
                items: [],
                totalItem: 0,
                cartTotalPrice: 0
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({ message: 'Product not available' });
        }

        // Find existing product in cart
        const existProductIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());

        // Update quantity or add new item
        if (existProductIndex > -1) {
            cart.items[existProductIndex].quantity += quantity;
            cart.items[existProductIndex].totalPrice += quantity * product.price;
        } else {
            cart.items.push({
                productId: productId,
                quantity: quantity,
                price: product.price,
                totalPrice: quantity * product.price
            });
        }

        // Recalculate total
        cart.totalItem = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.cartTotalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        await cart.save();
        res.status(200).json({ message: "Product added to cart successfully", cart });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Add specific product to cart
router.get('/addcart/:productId', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        
        // Render the addcart page with the product data and userId from session
        res.render('addcart', { product, userId: req.session.user.userId });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// View cart route
router.get('/view_cart', isAuthenticated, async (req, res) => {
    const userId = req.session?.user?.userId;
  
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
  
    try {
      const cart = await Cart.findOne({ userId }).populate('items.productId');
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found for this user' });
      }
  
      res.status(200).render('viewcart', { cart });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  


//clearing cart

router.delete('/clear_cart', isAuthenticated, async(req, res)=>{
    const userId = req.session.user.userId

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