const Category = require('../models/categoryModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')

exports.getAllCategories = factory.getAll(Category)

exports.createCategory = factory.createOne(Category)

exports.updateCategory = factory.updateOne(Category)

exports.deleteCategory = factory.deleteOne(Category)
