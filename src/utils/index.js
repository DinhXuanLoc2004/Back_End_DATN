const _ = require('lodash')
const bcrypt = require('bcrypt')
const { Types } = require('mongoose')
const cloudianry = require('../configs/config.cloudinary')
const { ConflictRequestError } = require('../core/error.reponse')
const crypto = require('crypto')
const DurationsConstants = require('../constants/durations.constants')

const convertBoolen = (condition) => condition === 'true' ? true : false

const convertTimestampToDate = (time) => {
    const date = new Date(time * 1000)
    return date
}

function isTimeExceededUTC(inputTime) {
    const currentUTC = new Date();
    const inputUTC = new Date(inputTime);
    const timeDifference = currentUTC - inputUTC;
    const fifteenMinutesInMs = DurationsConstants.DURATION_ZALO_PAY * 1000;
    return timeDifference > fifteenMinutesInMs;
}

const createdSignatueMomo = ({ accessKey, secretKey, amount, extraData,
    ipnUrl, orderId, orderInfo, partnerCode,
    redirectUrl, requestId, requestType }) => {
    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
    var signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    return signature
}

const convertToDate = time => new Date(time)

const convertToObjectId = _id => new Types.ObjectId(_id)

const convertVNDToUSD = (amountInVND) => {
    const exchangeRate = 24000;
    const amountInUSD = amountInVND / exchangeRate;
    return amountInUSD.toFixed(2);
}

const selectFilesData = ({ fileds = [], object = {} }) => {
    return _.pick(object, fileds)
}

const unselectFilesData = ({ fields = [], object = {} }) => {
    return Object.fromEntries(
        Object.entries(object).filter(([key]) => !fields.includes(key))
    );
};

const selectMainFilesData = (object = {}) => {
    const data = unselectFilesData({ fields: ['createdAt', 'updatedAt', '__v'], object })
    return data
}

const validateHexColor = (hex_color) => !/^#[0-9A-Fa-f]{6}$/.test(hex_color)

const deleteImage = (public_id) => {
    cloudianry.uploader.destroy(public_id, (error, result) => {
        if (error) {
            console.log('Error delete image utily:: ', error);
        } else {
            console.log('Result delete image utily:: ', result);
        }
    })
}

const validateTime = (time_start, time_end) => {
    const date = new Date()
    if (convertToDate(time_end) < date) throw new ConflictRequestError('Invalid time!')
    if (convertToDate(time_start) >= convertToDate(time_end)) throw new ConflictRequestError('Start time must be before end time!')
}

const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}

const hashData = async (data, numberSalt) => {
    const salt = await bcrypt.genSalt(numberSalt ?? 10)
    const data_hash = await bcrypt.hash(data, salt)
    return data_hash
}

const compareData = async ({ data, hashData }) => {
    const isValid = await bcrypt.compare(data, hashData)
    return isValid
}

const addMinutes = (minutes) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

const formatStringToArray = (stringData) => {
    let formattedStringData = stringData.replace(/(\w{24})/g, '"$1"');
    let arrayData = JSON.parse(formattedStringData);
    return arrayData
}

module.exports = {
    selectFilesData,
    asyncHandler,
    hashData,
    compareData,
    addMinutes,
    formatStringToArray,
    convertToObjectId,
    convertToDate,
    unselectFilesData,
    deleteImage,
    validateTime,
    selectMainFilesData,
    validateHexColor,
    createdSignatueMomo,
    convertVNDToUSD,
    isTimeExceededUTC,
    convertTimestampToDate,
    convertBoolen
}