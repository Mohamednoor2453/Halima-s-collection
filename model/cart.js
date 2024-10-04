const { mongo } = require("mongoose");

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cartSchema = new Schema ({
    userId: {
        type:
        mongoose.Schema.Types.ObjectId,
        ref: 'User',//reference to User model
        required: true
    }, 
    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref: 'Product',//reference to Product model
                required:true
            },
            quantity:{
                type: Number,
                required:true,
                default:1
            },
            price:{
                type:Number,
                required:true
            },
            totalPrice:{
                type:Number,
                required:true
            }

        }
    ],

    totalItem:{
        type:Number,
        required:true,
        default: 0
    },
    cartTotalPrice:{
        type:Number,
        required:true,
        default: 0.0
    },

    createdAt:{
        type: Date,
        default:Date.now
    }
});

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart