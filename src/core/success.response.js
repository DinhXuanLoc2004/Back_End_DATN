const StatusCode = {
    OK: 200,
    CREATED: 201,
    FAILED: 203
}

const ReasonStatusCode = {
    OK: 'Success',
    CREATED: 'Created!',
    FAILED: 203
}

class SuccessResponse {
    constructor({ message, statusCode = StatusCode.OK, reasonStatusCode = ReasonStatusCode.OK, metadata = {} }) {
        this.message = !message ? reasonStatusCode : message
        this.status = statusCode
        this.metadata = metadata
    }

    send(res, headers = {}) {
        return res.status(this.status).json(this)
    }
}

class OK extends SuccessResponse{
    constructor({message, metadata}){
        super({message, metadata})
    }
}

class CREATED extends SuccessResponse{
    constructor({message, statusCode = StatusCode.CREATED, reasonStatusCode = ReasonStatusCode.CREATED, metadata}){
        super({message, statusCode, reasonStatusCode, metadata})
    }
}

class FailResponse extends SuccessResponse{
    constructor({message, statusCode = StatusCode.FAILED, reasonStatusCode = ReasonStatusCode.FAILED, metadata}){
        super({message, statusCode, reasonStatusCode, metadata})
    }
}

module.exports = {
    OK, CREATED, SuccessResponse, FailResponse
}