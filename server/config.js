let fs = require('fs'),
dataPath = __dirname + '/data/micb_fixture.json'
let db = JSON.parse(fs.readFileSync(dataPath, 'UTF-8'))

export default {
    port: process.env.PORT || 4444,
    accountData: db
  }
