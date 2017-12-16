const express = require('express'),
app = express(),
config = require('./config'),
bodyParser = require('body-parser'),
fs = require('fs')
configPath = __dirname + '/data/micb_fixture.json'
let db = JSON.parse(fs.readFileSync(configPath, 'UTF-8'))

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
  let name = req.body.result.parameters.account
  let origin
  if ( req.body.originalRequest) {
    origin = req.body.originalRequest.source;
  } else {
    origin =  req.body.result.source
  }
  let account = db.data.accounts.find((account) => (account.name === name))

  let speech = req.body.result.fulfillment.speech + ` ${account.balance} ${account.currency_code}`

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