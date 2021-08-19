const multer = require('multer')
const slugify = require('slugify')
const Recipe = require('../models/recipeModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')
const path = require('path')

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/img/recipes'))
    },
    filename: (req, file, cb) => {
        const nameSlug = slugify(req.body.name, { lower: true })
        cb(null, `recipe-${nameSlug}-${file.originalname}`)
    },
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image, Please upload only images', 400))
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

exports.uploadRecipePhoto = upload.single('imageCover')

exports.getAllRecipes = factory.getAll(Recipe)

exports.createRecipe = catchAsync(async (req, res, next) => {
    const recipe = await Recipe.create({
        ...req.body,
        imageCover: `http://127.0.0.1:3000/img/recipes/${req.file.filename}`,
    })

    res.status(201).json({
        status: 'success',
        data: {
            data: recipe,
        },
    })
})

exports.updateRecipe = catchAsync(async (req, res, next) => {
    const body = req.body
    if (req.file)
        body.imageCover = `http://127.0.0.1:3000/img/recipes/${req.file.filename}`

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
    })

    if (!recipe) {
        return next(new AppError('No document Found With That ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: recipe,
        },
    })
})

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
