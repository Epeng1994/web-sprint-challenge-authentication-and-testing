require('dotenv').config()
const secret= process.env.JWT_SECRET || 'spoopy'

module.exports = secret