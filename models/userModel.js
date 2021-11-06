const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        maxlength: [
            40,
            'A user name must have less or equal than 40 characters',
        ],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide your email!'],
        maxlength: [
            40,
            'A user email must have less or equal than 40 characters',
        ],
        minlength: [
            10,
            'A user email must have more or equal than 10 characters',
        ],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!'],
    },
    photo: {
        type: String,
        default: 'https://panda-restaurant.herokuapp.com/img/users/default.jpg',
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'A password must have more or equal than 8 characters!'],
        select: false, // to not appear when querying the user
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            // This is only works on CREATE and SAVE!!!!
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not the same!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
    },
})

// hashing and salting the password BEFORE saving it to the DB
userSchema.pre('save', async function (next) {
    // only run this function if password was modified or created
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12) // 12  salting string rounds
    this.passwordConfirm = undefined // deleting password confirm
    next()
})

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000 // to be sure that is set before the JWT
    next()
})

// Query middleware  for any Query starts with find
// userSchema.pre(/^find/, function (next) {
//     // "this" points to the current query
//     this.find({ active: { $ne: false } })
//     next()
// })

// Defining a method available to all documents to compare password to the hashed one
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    // this.password won't work because I set select to false, so that I created candidatePassword
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        )
        return JWTTimestamp < changedTimestamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
