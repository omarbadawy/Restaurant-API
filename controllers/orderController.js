const Order = require('../models/orderModel')
const Recipe = require('../models/recipeModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')
const isObject = require('../utils/isObject')

exports.createOrder = catchAsync(async (req, res, next) => {
    const { orderContent, customerAddress, customerPhoneNumber } = req.body
    const orderData = []
    let totalPrice = 0

    if (!orderContent || !customerAddress || !customerPhoneNumber) {
        return next(new AppError('Please provide missing data', 400))
    }

    if (!Array.isArray(orderContent)) {
        return next(new AppError('Please provide correct form of data', 400))
    }

    if (orderContent.length === 0) {
        return next(new AppError('Order content can not be empty', 400))
    }

    for (const recipeInfo of orderContent) {
        if (!isObject(recipeInfo)) {
            return next(
                new AppError('Please provide correct form of data', 400)
            )
        }

        const existingRecipe = await Recipe.findById(recipeInfo.recipeId)

        if (!existingRecipe) {
            return next(new AppError('There is no recipe with that id', 404))
        }

        let totalPriceForOneRecipe =
            recipeInfo.amount * existingRecipe.price || existingRecipe.price

        totalPrice += totalPriceForOneRecipe

        const orderRecipe = {
            recipeId: existingRecipe._id,
            recipeName: existingRecipe.name,
            recipeAmount: recipeInfo.amount || 1,
            recipePrice: existingRecipe.price,
        }
        orderData.push({ ...orderRecipe })
    }

    const order = await Order.create({
        orderContent: orderData,
        totalPrice,
        customerId: req.user._id,
        customerName: req.user.name,
        customerEmail: req.user.email,
        customerAddress,
        customerPhoneNumber,
        createdAt: Date.now(),
    })

    res.status(201).json({
        status: 'success',
        data: order,
    })
})

exports.getAllOrders = factory.getAll(Order)

exports.getUserOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ customerId: req.user._id })

    res.status(200).json({
        status: 'success',
        data: orders,
    })
})

exports.cancelOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new AppError('There is no order with that id', 404))
    }

    if (!order.customerId.equals(req.user._id)) {
        return next(
            new AppError('You do not have permission to do this action', 403)
        )
    }

    if (order.orderedAfterFiveMins()) {
        return next(
            new AppError('Sorry you can not cancel an order after 5 mins', 403)
        )
    }

    await Order.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status: 'success',
        data: {
            data: null,
        },
    })
})
