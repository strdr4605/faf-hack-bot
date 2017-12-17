import config from './config'
import PlotGenerator from './plotGenerator'

export default class IntentsProcessing {
  constructor() {
    this.data = config.accountData.data
    this.plotGenerator = new PlotGenerator()
  }

  speechParser(req) {
    let intentName = req.body.result.metadata.intentName
    switch (intentName) {
      case "actual-balance":
        return this.accountBalance(req)
        break
      case "last x transaction":
        return this.lastXTransactions(req)
        break
    }
  }

  replaceByTemplate(template, ...args) {
    args.forEach((elem, index) => (template = template.replace("{0}", elem)))
    return template
  }

  accountBalance(req) {
    let name = req.body.result.parameters.account
    let speech
    if (name) {
      let account = this.data.accounts.find((account) => (account.name === name))
      if (account) {
        let smile = account.balance > 0 ? " (y)" : " :("
        speech = this.replaceByTemplate(req.body.result.fulfillment.speech, account.name, account.balance, account.currency_code) + smile
      } else {
        speech = "Sorry, can't find such account!"
      }
    } else {
      let accounts = this.data.accounts
      if (accounts.length) {
        speech = "The following accounts are available:\n"
        accounts.forEach((elem) => {
          let smile = elem.balance > 0 ? " (y)" : " :("
          speech += " - " + this.replaceByTemplate(req.body.result.fulfillment.speech, elem.name, elem.balance, elem.currency_code) + smile + "\n"
        })
      } else {
        speech = "Ups... No available accounts!"
      }
    }
    return speech
  }

  lastXTransactions(req) {
    let transactionCount = req.body.result.parameters.number
    return "Hello"
  }

  getPlot(req) {
    let origin
    if (req.body.originalRequest) {
      origin = req.body.originalRequest.source
    } else {
      origin = req.body.result.source
    }
    let platform = origin
    let messages = [
      {
        imageUrl: this.plotGenerator.getImageUrl(req),
        platform: platform,
        type: 3
      }
    ]

    return messages
  }
}
