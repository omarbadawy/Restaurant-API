const mongoose = require('mongoose')
const slugify = require('slugify')

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A recipe must have a name'],
        unique: true,
        trim: true,
        maxlength: [
            25,
            'A recipe name must have less or equal than 25 characters',
        ],
        minlength: [
            3,
            'A recipe name must have more or equal than 3 characters',
        ],
    },
    slug: String,
    ingredients: {
        type: [String],
        required: [true, 'A recipe must have ingredients'],
        validate: (v) => Array.isArray(v) && v.length > 0,
    },
    price: {
        type: Number,
        required: [true, 'A recipe must have a price'],
    },
    cookingTime: {
        type: Number,
        required: [true, 'A recipe must have a cooking time'],
    },
    imageCover: {
        type: String,
        required: [true, 'A recipe must have a cover image'],
    },
    category: {
        type: String,
        required: [true, 'A recipe must belong to a category'],
    },
})

recipeSchema.index({ name: 'text' })

recipeSchema.index({ slug: 1 })

// Documnet Middleware will run before the .save() and .create() Not on insertMany()
recipeSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

const Recipe = mongoose.model('Recipe', recipeSchema)

module.exports = Recipe
