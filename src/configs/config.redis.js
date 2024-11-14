const redis = require('redis');
const { orderModel } = require('../models/order.model');
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

async function handleResdis() {
    await redis_client.connect()
        .then(() => console.log('Connect success with Redis!'))
        .catch((err) => console.error('Kết nối Redis thất bại:', err));

    await redis_subscriber.connect()
        .then(() => console.log('Connect success with Redis subscriber!'))
        .catch((err) => console.error('Kết nối Redis thất bại:', err));

    await redis_client.sendCommand(['CONFIG', 'SET', 'notify-keyspace-events', 'Ex']);

    await redis_subscriber.pSubscribe("__keyevent@0__:expired", async (message) => {
        await orderModel.findByIdAndUpdate(message, {order_status: 'canceled'}, {new: true})
    });
}

handleResdis()

module.exports = {redis_client, redis_subscriber}