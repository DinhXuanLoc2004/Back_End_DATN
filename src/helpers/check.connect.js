const { default: mongoose } = require("mongoose")
const os = require('os')
const process = require('process')
const SECONDS = 30000

const countConnect = () => {
    const numConnection = mongoose.connections.length
    return numConnection
}

const checkOverLoad = () => {
    setInterval(() => {
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss
        const maxConnection = (numCores * 5) * 0.9
        console.log(`Active connections:${countConnect()}`)
        console.log(`Memory usage:${memoryUsage / 1024 / 1024} MB`)
        if (countConnect() > maxConnection) {
            console.log(`Connection overload detected`)
        }
    }, SECONDS)
}

module.exports = {countConnect, checkOverLoad}