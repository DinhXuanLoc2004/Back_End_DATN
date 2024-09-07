const _ = require('lodash')
const bcrypt = require('bcrypt')

const selectFilesData = ({ fileds = [], object = {} }) => {
    return _.pick(object, fileds)
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
    formatStringToArray
}