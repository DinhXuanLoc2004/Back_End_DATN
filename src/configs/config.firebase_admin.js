const admin = require('firebase-admin')
const { applicationDefault } = require('firebase-admin/app')
require('dotenv').config()

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

module.exports = admin