const { redis_client, redis_subscriber } = require("../configs/config.redis");
const OrderService = require("../services/order.service");
const { VALUE_ORDER_ID_KEY } = require("../services/redis.service");
const { asyncHandler } = require("../utils");

async function handleResdis() {
    await redis_client.connect()
        .then(() => console.log('Connect success with Redis!'))
        .catch((err) => console.error('Kết nối Redis thất bại:', err));

    await redis_subscriber.connect()
        .then(() => console.log('Connect success with Redis subscriber!'))
        .catch((err) => console.error('Kết nối Redis thất bại:', err));

    await redis_client.sendCommand(['CONFIG', 'SET', 'notify-keyspace-events', 'Ex']);

    await redis_subscriber.pSubscribe("__keyevent@0__:expired", async (message) => {
        console.log(message);
        const value = await redis_client.get(message)
        if (value === VALUE_ORDER_ID_KEY) {
            asyncHandler(await OrderService.cancelOrderPaymentDealine({order_id: message}))
        }
    });
}

handleResdis()