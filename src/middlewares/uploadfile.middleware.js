const multer = require('multer')
const upload = multer()
const cloudinary = require('../configs/config.cloudinary')
const { asyncHandler } = require('../utils')
const { ConflictRequestError } = require('../core/error.reponse')

const pattern = /^.*\.(jpg|jpeg|png|gif|bmp|tiff|WEBP)$/i

const deleteImageMiddleware = asyncHandler(async (req, res, next) => {
    const public_id = req.body.image.public_id
    if (!public_id) next()
    cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) {
            console.log('Error delete image cloudinary:: ', error);
        } else {
            console.log('Result delete image cloudianry:: ', result);
        }
    })
    return req
})

const uploadSingleImageMiddleware = asyncHandler(async (req, res, next) => {
    const images = req.file
    if (!images) next()
    if (!pattern.test(image.originalname)) throw new ConflictRequestError('Invalid file!')
    const data = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream((err, uploadResult) => {
            if (err) reject(err)
            const { public_id, url } = uploadResult
            return resolve({ public_id, url })
        }).end(image.buffer)
    })
    req.body.images = data
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
    uploadSingleImageMiddleware,
    deleteImageMiddleware
}