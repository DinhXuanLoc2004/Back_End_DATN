const multer = require('multer')
const upload = multer()
const cloudinary = require('../configs/config.cloudinary')
const { asyncHandler } = require('../utils')

const uploadImageMiddleware = asyncHandler(async (req, res, next) => {
    if (!req.files || !Array.isArray(req.files)) {
        next()
    }
    const pattern = /^.*\.(jpg|jpeg|png|gif|bmp|tiff|WEBP)$/i
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
    uploadImageMiddleware
}