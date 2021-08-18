const path = require('path')
const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')
const compression = require('compression')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const userRouter = require('./routes/userRoutes')
const categoryRouter = require('./routes/categoryRoutes')

const app = express()

// Global middlewares
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

// Set security HTTP headers
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
)

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
})

app.use('/api', limiter)

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(hpp())

// Test middleware

app.use(compression())

// Mounting routers
app.use('/api/v1/users', userRouter)

app.use('/api/v1/categories', categoryRouter)

// all stands for all http methods
app.all('*', (req, res, next) => {
    /*
        Express will assume that any argument passed to next is an error and then it will skip all
        The other middlewares in the middleware stack and send the error that we passed in to
        the global error handling middleware
     */
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 400))
})

app.use(globalErrorHandler)

module.exports = app
