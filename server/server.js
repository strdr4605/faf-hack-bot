import config from './config'
import IntentsProcessing from './IntentsProcessing'

export default class Server {
  constructor(app) {
    this.app = app
    this.createBasicRoute()
    this.start()
    this.intent = new IntentsProcessing()
  }

  start() {
    this.app.listen(config.port, () => {
      console.log('Application is running on port ' + config.port)
    })
  }

  createBasicRoute() {
    this.app.get('/api/v1', (req, res) => {
      res.send('Hi')
    })
    this.app.post('/api/v1', (req, res) => {
      this.dialogFlowPost(req, res)
    })
  }

  dialogFlowPost(req, res) {
    let origin
    if (req.body.originalRequest) {
      origin = req.body.originalRequest.source
    } else {
      origin = req.body.result.source
    }

    let messages = this.intent.speechParser(req)

    res.send({
      messages: messages,
      displayText: "123",
      data: {},
      contextOut: [],
      source: origin
    })
  }
}
