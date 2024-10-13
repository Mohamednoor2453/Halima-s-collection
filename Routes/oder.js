const express = require('express')
const Cart = require('../model/cart.js')
const Product = require('../model/product.js')
const Oder = require('../model/oder.js')


const router = express.Router()

router.post('/checkout', async (req, res) => {
    const { userId } = req.body;

    try {
        //Find the cart for the user
        let cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(400).json({ message: "Cart does not exist" });
        }

        //  Verify stock for each product in the cart
        for (let item of cart.items) {
            const product = item.productId;

            if (!product) {
                return res.status(400).json({ message: `Product with ID ${item.productId} does not exist` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }

            // If the product price has changed, update the item total
            item.totalPrice = item.quantity * product.price;
        }

        //  Recalculate the total price and items in the cart
        cart.totalItem = cart.items.reduce((total, item) => total + item.quantity, 0);
        cart.cartTotalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // 4. Create a new Order
        const order = new Oder({
            userId: cart.userId,
            items: cart.items,
            totalItems: cart.totalItem,
            totalPrice: cart.cartTotalPrice
        });

        await order.save();

        // Reduce product stock only after saving the order
    for (let item of cart.items) {
        let product = await Product.findById(item.productId);
        product.stock -= item.quantity;
        await product.save();
    }

        //Mark the cart as completed or clear it
        cart.items = [];
        cart.totalItem = 0;
        cart.cartTotalPrice = 0;
        await cart.save();

        res.status(200).json({ message: 'Checkout completed successfully', order });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router