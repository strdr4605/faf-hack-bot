import config from './config'

export default class Server {
  constructor(app) {
    this.app = app
    this.createBasicRoute()
    this.start()
  }

  start() {
    this.app.listen(config.port, () => {
      console.log('Application is running on port ' + config.port)
    })
  }

  createBasicRoute() {
    this.app.get('/api/v1', (req, res)=> {
      res.send('Hi')
    })
  }

  dialogFlowPost() {
    this.app.post('/api/v1', (req, res) => {
      let name = req.body.result.parameters.account
      let origin
      if ( req.body.originalRequest) {
        origin = req.body.originalRequest.source;
      } else {
        origin =  req.body.result.source
      }
      let account = accountData.data.accounts.find((account) => (account.name === name))

      let speech = account ? req.body.result.fulfillment.speech + ` ${account.balance} ${account.currency_code}` : `Sorry, can't find it!`

      res.send({
        speech: speech,
        displayText: "123",
        data: {},
        contextOut: [],
        source: origin
      })
    })
  }


}
