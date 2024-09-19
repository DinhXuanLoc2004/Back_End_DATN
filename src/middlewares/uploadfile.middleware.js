const multer = require('multer')
const upload = multer()
const cloudinary = require('../configs/config.cloudinary')
const { asyncHandler } = require('../utils')
const { ConflictRequestError } = require('../core/error.reponse')

const pattern = /^.*\.(jpg|jpeg|png|gif|bmp|tiff|WEBP)$/i

const uploadSingleImageMiddleware = asyncHandler(async (req, res, next) => {
    const image = req.file
    if (!image) next()
    if (!pattern.test(image.originalname)) throw new ConflictRequestError('Invalid file!')
    const data = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream((err, uploadResult) => {
            if (err) reject(err)
            const { public_id, url } = uploadResult
            return resolve({ public_id, url })
        }).end(image.buffer)
    })
    req.body.image = data
    next()
})

const uploadImageMiddleware = asyncHandler(async (req, res, next) => {
    if (!req.files || !Array.isArray(req.files)) {
        next()
    }

    const images = req.files.reduce((files, file) => {
        if (pattern.test(file.originalname)) {
            const asyncImage = new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream((err, uploadResult) => {
                    if (err) reject(err)
                    const { public_id, url } = uploadResult
                    return resolve({ public_id, url })
                }).end(file.buffer)
            })
            files.push(asyncImage)
        }
        return files
    }, [])

    const data = await Promise.all(images)
    req.body.images = data
    next()
})

module.exports = {
    upload,
    uploadImageMiddleware,
    uploadSingleImageMiddleware
}