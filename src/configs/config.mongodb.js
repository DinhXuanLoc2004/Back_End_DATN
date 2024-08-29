const PORT_DEFAULT = 5000
const dev = {
    app: {
        port: process.env.APP_DEV_PORT || PORT_DEFAULT
    },
    db: {
        host_db: process.env.DB_DEV_HOST || `localhost`,
        port_db: process.env.DB_DEV_PORT || `27017`,
        name_db: process.env.DB_DEV_NAME || `T_Shop_Dev`
    }
}
const production = {
    app: {
        port: process.env.APP_PRO_PORT || PORT_DEFAULT
    },
    db: {
        host_db: process.env.DB_PRO_HOST || `localhost`,
        port_db: process.env.DB_PRO_PORT || `27017`,
        name_db: process.env.DB_PRO_NAME || `T_Shop`
    }
}

const config = { dev, production }
const env = process.env.NODE_ENV || 'dev'

module.exports = config[env]