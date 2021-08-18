const Recipe = require('../models/recipeModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')

exports.getAllRecipes = factory.getAll(Recipe)

exports.createRecipe = factory.createOne(Recipe)

exports.updateRecipe = factory.updateOne(Recipe)

exports.deleteRecipe = factory.deleteOne(Recipe)

exports.recipeSearch = catchAsync(async (req, res, next) => {
    const { s } = req.query

    if (!s) {
        return next()
    }

    const docs = await Recipe.find({ $text: { $search: s } }).limit(10)

    res.status(200).json({
        status: 'success',
        data: {
            data: docs,
        },
    })
})
