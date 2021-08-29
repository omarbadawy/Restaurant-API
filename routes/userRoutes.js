const express = require('express')
const {
    login,
    signup,
    protect,
    restrictTo,
    updatePassword,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController')

const {
    deleteMe,
    deleteUser,
    getAllUsers,
    getMe,
    getUser,
    updateUser,
    updateMe,
} = require('../controllers/userController')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

// Protect all the routes after this
router.use(protect)

router.patch('/updateMyPassword', updatePassword)

router.get('/me', getMe, getUser)
router.delete('/deleteMe', deleteMe)
router.patch('/updateMe', updateMe)

// Restrict all the routes to admin after this
router.use(restrictTo('admin'))

router.route('/').get(getAllUsers)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

module.exports = router
