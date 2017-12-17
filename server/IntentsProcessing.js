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
    let name = req.body.result.parameters.account
    if (!name) {
      return "No account specified!";
    }
    console.log("Account name", name);
    console.log("Transaction count", transactionCount);
    if (transactionCount === 0 || transactionCount === "0") {
      return "Nothing to display!"
    } else if (!transactionCount) {
      transactionCount = 1
    }
    let account = this.data.accounts.find((account) => (account.name === name))
    let transactions = account.transactions
    if (!transactions) {
      return "No transactions available!"
    }
    if (transactionCount > transactions.length) {
      transactionCount = transactions.length
    }
    let speech = "Last " + transactionCount + " are:\n"
    for (var i = 1; i <= transactionCount; i++) {
      let transaction = transactions[transactions.length - i]
      speech += i + ". " + transaction.amount + " " + transaction.currency_code + ", " + transaction.made_on + ", " + transaction.description + "\n"
    }
    if (transactionCount === transactions.length) {
      speech += "No more transactions!";
    }
    return speech
  }

  transactionsBetween(req) {
    let startDate = req.body.result.parameters.date1
    let endDate = req.body.result.parameters.date2
    let name = req.body.result.parameters.account
    let account = this.data.accounts.find((account) => (account.name === name))
    let transactions = account.transactions
    let speech = "Transactions between date " + startDate + " and " + endDate + " are:\n"
    let bool = false
    transactions.forEach((transaction, i) => {
      if (new Date(transaction.made_on) >= new Date(startDate) && new Date(transaction.made_on) <= new Date(endDate)) {
        bool = true;
        speech += (i + 1) + ". " + transaction.amount + " " + transaction.currency_code + ", " + transaction.made_on + ", " + transaction.description + "\n"
      }
    });
    if (bool) {
      return speech
    }
    return "No transactions to be displayed!"
  }

  transactionsOn(req) {
    let date = req.body.result.parameters.date
    let name = req.body.result.parameters.account
    let account = this.data.accounts.find((account) => (account.name === name))
    let transactions = account.transactions
    let speech = "Transactions on date " + date + " are:\n"
    let bool = false
    transactions.forEach((transaction, i) => {
      if (new Date(transaction.made_on).getTime() === new Date(date).getTime()) {
        bool = true;
        speech += (i + 1) + ". " + transaction.amount + " " + transaction.currency_code + ", " + transaction.made_on + ", " + transaction.description + "\n"
      }
    });
    if (bool) {
      return speech
    }
    return "No transactions to be displayed!"
  }

  speechParser(req) {
    let messages = []
    let object
    let intentName = req.body.result.metadata.intentName
    switch (intentName) {
      case "actual-balance":
        object = this.getSpeechObject(this.accountBalance(req), req)
        break
      case "last x transaction":
        object = this.getSpeechObject(this.lastXTransactions(req), req)
        break
      case "transaction between":
        object = this.getSpeechObject(this.transactionsBetween(req), req)
        break
      case "transaction on":
        object = this.getSpeechObject(this.transactionsOn(req), req)
        break
      }
      messages.push(object)

      return messages
  }

  getPeriod(req) {
    let name = req.body.result.parameters.account
    let period = req.body.result.parameters.period
    let monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
    let speech
    if (name) {
      let account = this.data.accounts.find((account) => (account.name === name))
      if (account) {
        let transactions = account.transactions
        if (monthNames.indexOf(period) === -1) {
          let monthsAmount = []
          yearTransactions = transactions.filter((el) => {
            let year = new Date(el.made_on).getFullYear()
            return year == period
          })
          monthNames.forEach((el, index) => {
            let monthAmount = transactions.filter((el) => (new Date(el.made_on).getMonth() == index))
                                          .reduce((el, sum) => (sum + el.amount), 0)
            monthsAmount.push(monthAmount)
          })

          return {
            x: monthNames,
            y: monthsAmount
          }
        } else {
          let days = []
          for(let i = 1; i <= this.daysInMonth(monthNames.indexOf(period) + 1); i++){
            days.push(i)
          }
          let daysAmount = days
          transactionsMonth = transactions.filter((el) => (new Date(el.made_on).getMonth() == monthNames.indexOf(period)))
          daysAmount = daysAmount.map((day) => {
            return transactionsMonth.filter((el)=> (new Date(el.made_on).getDate() == day))
                                    .reduce((el, sum) => (sum += el.amount), 0)
          })
          
          return {
            x: days,
            y: daysAmount
          }
        }
      
      } else {
        return {}
      }
    }
  }

  daysInMonth(month) {
    return new Date(new Date().getFullYear() , 2, 0).getDate()
  }


  getPlatform(req) {
    if (req.body.originalRequest) {
      return req.body.originalRequest.source
    } else {
      return req.body.result.source
    }
  }

  getPlot(req) {
    let platform = this.getPlatform(req)
    return {
        imageUrl: this.plotGenerator.getImageUrl(req),
        platform: platform,
        type: 3
      }
  }

  imageParser(req) {
    let intentName = req.body.result.metadata.intentName
    return "https://3c1703fe8d.site.internapcdn.net/newman/gfx/news/hires/2016/63-scientistsdi.jpg";
  }

  getSpeechObject(speech, req) {
    let platform = this.getPlatform(req)
    return {
      "platform": platform,
      "speech": speech,
      "type": 0
    }
  }
}
