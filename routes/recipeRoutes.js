const express = require('express')
const {
    createRecipe,
    deleteRecipe,
    getAllRecipes,
    updateRecipe,
    recipeSearch,
} = require('../controllers/recipeController')
const { protect, restrictTo } = require('../controllers/authController')
const { multerUploads } = require('../utils/multer')

const router = express.Router()

router
    .route('/')
    .get(getAllRecipes)
    .post(multerUploads, protect, restrictTo('admin'), createRecipe)

router
    .route('/:id')
    .patch(multerUploads, protect, restrictTo('admin'), updateRecipe)
    .delete(deleteRecipe)

router.route('/search').get(recipeSearch)
module.exports = router
