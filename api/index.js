let compression = require('compression')
const express = require('express')

// Create express instance
const app = express()

// Require API routes
const datos = require('./routes/datos')

// Import API Routes
app.use(compression())
app.use(datos)

// Export the server middleware
module.exports = {
  path: '/api',
  handler: app
}
