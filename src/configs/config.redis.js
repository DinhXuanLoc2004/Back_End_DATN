const redis = require('redis');
require('dotenv').config()

const redis_client = redis.createClient({
    socket: {
        host: process.env.HOST_REDIS,
        port: process.env.PORT_REDIS
    },
    password: process.env.PASSWORD_REDIS
})

const redis_subscriber = redis.createClient({
    socket: {
        host: process.env.HOST_REDIS,
        port: process.env.PORT_REDIS
    },
    password: process.env.PASSWORD_REDIS
})

module.exports = {redis_client, redis_subscriber}