const AppError = require('../utils/appError')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

const filterObj = (obj, ...allowedFeilds) => {
    const newObj = {}
    Object.keys(obj).forEach((el) => {
        if (allowedFeilds.includes(el)) {
            newObj[el] = obj[el]
        }
    })
    return newObj
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false,
    })

    res.status(204).json({
        status: 'success',
        data: null,
    })
})

exports.getAllUsers = factory.getAll(User)

exports.getUser = factory.getOne(User)

// Don't update passwords with this
exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)
