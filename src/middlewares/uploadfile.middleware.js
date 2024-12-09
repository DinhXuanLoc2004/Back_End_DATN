const multer = require('multer')
const upload = multer()
const cloudinary = require('../configs/config.cloudinary')
const { asyncHandler } = require('../utils')
const { ConflictRequestError } = require('../core/error.reponse')

const pattern = /^.*\.(jpg|jpeg|png|gif|bmp|tiff|WEBP)$/i
const pattern_media = /^.*\.(jpg|jpeg|png|gif|bmp|tiff|webp|mp4|avi|mov|mkv|wmv|flv|webm)$/i;


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
    const image = req.file
    if (!image) return next()
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
    if (!req.body.images || !Array.isArray(req.body.images)) {
        return next()
    }

    console.log(req.body.images);
    const images = req.body.images.reduce((files, file) => {
        if (file.url && file.public_id && file.type) {
            files.push(Promise.resolve(file))
        } else {
            if (pattern_media.test(file.originalname)) {
                const resource_type = pattern.test(file.originalname) ? 'image' : 'video'
                const asyncImage = new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream({ resource_type: resource_type },
                        (err, uploadResult) => {
                            if (err) reject(err)
                            const { public_id, url } = uploadResult
                            return resolve({ public_id, url, type: resource_type })
                        }).end(file.buffer)
                })
                files.push(asyncImage)
            }
        }
        return files
    }, [])

    const data = await Promise.all(images)
    req.body.images = data
    return next()
})

module.exports = {
    upload,
    uploadImageMiddleware,
    uploadSingleImageMiddleware,
    deleteImageMiddleware
}