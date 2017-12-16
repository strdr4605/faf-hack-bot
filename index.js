const express = require('express'),
app = express(),
config = require('./config'),
bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({
extended: false
}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({
    message: 'Hi'
  })
})

app.post('/', (req, res) => {
  var speech = "Hello, " + JSON.stringify(req.body.result.fulfillment.speech)
  var origin
  if ( req.body.originalRequest) {
    origin = req.body.originalRequest.source;
  } else {
    origin =  req.body.result.source
  }

  res.send({
    speech: speech,
    displayText: "123",
    data: {},
    contextOut: [],
    source: origin
  })
})

app.listen(config.port, () => {
console.log('Application is running on port ' + config.port)
})