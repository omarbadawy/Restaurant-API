const mongoose = require('mongoose')
const validator = require('validator')
const msToMins = require('../utils/msToMins')

const orderSchema = new mongoose.Schema({
    orderContent: [
        {
            recipeId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Recipe',
                require: true,
            },
            recipeName: { type: String, require: true },
            recipeAmount: { type: Number, require: true },
            recipePrice: { type: Number, require: true },
        },
    ],
    totalPrice: {
        type: Number,
        required: [true, 'Order must have a total price'],
    },
    customerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Order must have a customer id'],
    },
    customerName: {
        type: String,
        required: [true, 'Order must have a customer name'],
    },
    customerEmail: {
        type: String,
        required: [true, 'Order must have a customer email'],
        validate: [validator.isEmail, 'Please provide a valid email!'],
    },
    customerAddress: {
        type: String,
        required: [true, 'Order must have a customer address'],
    },
    customerPhoneNumber: {
        type: String,
        required: [true, 'Order must have a customer phone number'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

orderSchema.methods.orderedAfterFiveMins = function () {
    const createdAtTimestamp = parseInt(this.createdAt.getTime())
    console.log('********')
    console.log(createdAtTimestamp)
    console.log('********')
    console.log(Date.now())
    console.log(msToMins(Date.now() - createdAtTimestamp))
    console.log(new Date(), this.createdAt)
    if (msToMins(Date.now() - createdAtTimestamp) >= 5) {
        return true
    }
    return false
}

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
