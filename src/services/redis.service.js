const { redis_client } = require("../configs/config.redis")
const DurationsConstants = require("../constants/durations.constants")

const VALUE_ORDER_ID_KEY = 'order_id'

class RedisService {
    static setExOrderID = async ({ order_id }) => {
        await redis_client.setEx(order_id, DurationsConstants.DURATION_DEALINE_PAYMENT, VALUE_ORDER_ID_KEY)
    }
}

module.exports = { RedisService, VALUE_ORDER_ID_KEY }