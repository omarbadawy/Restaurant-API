const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    // Remove the password from the output
    user.password = undefined
    user.active = undefined
    user.__v = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    })

    // const url = `${req.protocol}://${req.get('host')}/me`
    // await new Email(newUser, url).sendWelcome()

    createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and passwords exists
    if (!email || !password) {
        return next(new AppError('Please provide email and passowrd!', 400))
    }

    // 2) Check if user exists && password is correct
    // select(+password) used because i prevented it from User Schema
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect Email or Password!', 401))
    }

    // 3) if everything is ok, send token to the client
    createSendToken(user, 200, res)
})
