const app = require("./src/app");
const PORT = 5000

const server = app.listen( PORT, () => {
    console.log(`Back End T_Shop start with port:: ${PORT}`)
})

process.on('SIGINT', () => {
    server.close(() => console.log('Closed Server Express'))
})