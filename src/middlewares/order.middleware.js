const { asyncHandler } = require("../utils");
const {redis_client} = require('../configs/config.redis')

class OrderMiddleWare {
    static processOrdersSimultaneously = asyncHandler(async (req, res, next) => { 
        await redis_client.incrBy()
    })
}