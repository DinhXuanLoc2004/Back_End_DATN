const mongoose = require('mongoose')
const { countConnect } = require('../helpers/check.connect')
const { db: { host_db, port_db, name_db } } = require('../configs/config.mongodb')
const connectString = `mongodb://${host_db}:${port_db}/${name_db}`

const MAX_POOL_SIZE = 100

class DataBase {
    constructor() {
        this.connect()
    } 
    connect(type = 'mongodb') {
        // if (true) {
        //     mongoose.set('debug', true)
        //     mongoose.set('debug', { color: true })
        // }
        mongoose.connect(connectString, {
            maxPoolSize: MAX_POOL_SIZE
        }).then(_ => {
            console.log(`Connected MongoDB Success with CountConnections::`, countConnect())
        })
            .catch(err => console.log(`Error Connect::`, err))
    }
    static getInstance() {
        if (!DataBase.instance) {
            DataBase.instance = new DataBase()
        }
        return DataBase.instance
    }
}

const instanceMongodb = DataBase.getInstance()
module.exports = instanceMongodb