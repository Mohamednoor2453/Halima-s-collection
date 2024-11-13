require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const Cart = require('../model/cart.js');
const Product = require('../model/product.js');
const Oder = require('../model/oder.js');

const router = express.Router();

// Function to send email
async function sendMail(userEmail, orderDetails, destination, phone) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS 
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Your Order Details',
        text: `Your order has been placed successfully! \n\nOrder Details: \n${orderDetails}\n\nDelivery Destination: ${destination}\nPhone: ${phone}`
    };

    return transporter.sendMail(mailOptions);
}

// Checkout route
router.post('/checkout', async (req, res) => {
    console.log('Checkout route hit');
    const { userId, email, destination, phone } = req.body;

    try {
        // Find the cart for the user
        let cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(400).json({ message: "Cart does not exist" });
        }

        // Verify stock for each product in the cart
        let orderDetails = '';
        for (let item of cart.items) {
            const product = item.productId;

            // Ensure the product is populated
            if (!product) {
                return res.status(400).json({ message: `Product with ID ${item.productId} does not exist` });
            }

            // Check if the product has enough stock
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }

            // Create a summary of the order
            orderDetails += `${product.name} - Quantity: ${item.quantity}, Price: ${product.price}\n`;
            item.totalPrice = item.quantity * product.price;
        }

        // Recalculate the total price and items in the cart
        cart.totalItem = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.cartTotalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Create a new Order
        const order = new Oder({
            userId: cart.userId,
            items: cart.items,
            totalItems: cart.totalItem,
            totalPrice: cart.cartTotalPrice,
            status: 'Pending'
        });

        await order.save();

        // Reduce product stock only after saving the order
        for (let item of cart.items) {
            let product = await Product.findById(item.productId);
            product.stock -= item.quantity;
            await product.save();
        }

        // Clear the cart
        cart.items = [];
        cart.totalItem = 0;
        cart.cartTotalPrice = 0;
        await cart.save();

        // Send email with order details
        await sendMail(email, orderDetails, destination, phone);

        res.status(200).redirect('/')

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;