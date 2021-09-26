const express = require('express')
const {
    createOrder,
    getAllOrders,
    getUserOrders,
    cancelOrder,
    deleteOrder,
} = require('../controllers/orderController')
const { protect, restrictTo } = require('../controllers/authController')

const router = express.Router()

// Protect all the routes after this
router.use(protect)
router.route('/').get(getUserOrders).post(createOrder)
router.route('/:id').delete(deleteOrder)
router.route('/cancelOrder/:id').delete(cancelOrder)

// Restrict all the routes to admin after this
router.use(restrictTo('admin'))

router.route('/all').get(getAllOrders)

module.exports = router
