// Import the needed npm packages
import express from 'express'
import logo from 'logo'

// Import the data API router
import apiRouter from './data/api'

// Port where the server will listed
const port = 3000

// Create the main express app and log all requests
const app = express()
app.use((req, res, next) => {
  console.log(`${req.method} request @ ${req.url}`)
  next()
})

// Setup the Data API router
app.use(apiRouter)

// Accept logo code as JSON and send to parser
app.use(express.json())
app.post('/parse', (req, res) => {
  // Is the request and its body properly formed?
  if (!req.body || !req.body.commands) {
    console.log(req.body)
    res.status(400).send(`Error: no commands or badly formed request`)    
  } else {
    // Try to parse the JSON commands
    logo.convert(req.body.commands, (err, obj) => {
      if (err) {
        // Something went wrong
        res.send({ error: err })
      } else {
        // Success, return the command stream
        res.json(obj)
      }
    })
  }
})

// Serve the public directory statically
app.use(express.static('public'))

// Start the server listening
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
