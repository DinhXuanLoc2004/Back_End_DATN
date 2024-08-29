require('dotenv').config()
const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const app = express()
const morgan = require('morgan')
const { checkOverLoad } = require('./helpers/check.connect')

// init middlewares
app.use(morgan("dev"))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(compression())

// init db
require('./dbs/init.mongodb')
// checkOverLoad()

// init routes
app.use('/', require('./routes/index'))

// handle error
app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})
app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
        stack: error.stack
    })
})

module.exports = app