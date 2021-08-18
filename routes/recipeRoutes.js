const express = require('express')
const {
    createRecipe,
    deleteRecipe,
    getAllRecipes,
    updateRecipe,
    recipeSearch,
} = require('../controllers/recipeController')
const { protect, restrictTo } = require('../controllers/authController')

const router = express.Router()

router
    .route('/')
    .get(getAllRecipes)
    .post(protect, restrictTo('admin'), createRecipe)

router.route('/search').get(recipeSearch)

// Protect all the routes after this
router.use(protect)

// Restrict all the routes to admin after this
router.use(restrictTo('admin'))

router.route('/:id').patch(updateRecipe).delete(deleteRecipe)

module.exports = router
