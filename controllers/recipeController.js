const multer = require('multer')
const slugify = require('slugify')
const Recipe = require('../models/recipeModel')
const Category = require('../models/categoryModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')
const path = require('path')

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/img/recipes'))
    },
    filename: async (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]
        let nameSlug

        if (!req.body.name) {
            recipe = await Recipe.findById(req.params.id)
            nameSlug = slugify(recipe.name, { lower: true })
        } else {
            nameSlug = slugify(req.body.name, { lower: true })
        }
        cb(null, `recipe-${nameSlug}.${ext}`)
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
    if (req.body.category) {
        const categoryExists = await Category.findOne({
            name: req.body.category,
        })
        if (!categoryExists) {
            return next(
                new AppError('There is no category with that name', 400)
            )
        }
    }

    const recipe = await Recipe.create({
        ...req.body,
        imageCover: `https://panda-restaurant.herokuapp.com/img/recipes/${req.file.filename}`,
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

    //console.log(req.body)
    if (req.body.category) {
        const categoryExists = await Category.findOne({
            name: req.body.category,
        })

        //console.log(categoryExists)
        if (!categoryExists) {
            return next(
                new AppError('There is no category with that name', 400)
            )
        }
    }

    if (req.file)
        body.imageCover = `https://panda-restaurant.herokuapp.com/img/recipes/${req.file.filename}`

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
    })

    if (!recipe) {
        return next(new AppError('No document Found With That ID', 404))
    }

    recipe.slug = slugify(recipe.name, { lower: true })
    await recipe.save()

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
