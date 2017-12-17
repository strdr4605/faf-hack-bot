import config from './config'
import PlotGenerator from './plotGenerator'
import http from 'http'
import moment from 'moment'
import babelPolyfill from 'babel-polyfill'
import babelCoreRegister from 'babel-core/register'
import AmazonAPI from './AmazonAPI'

export default class IntentsProcessing {
  constructor() {
    this.data = config.accountData.data
    this.plotGenerator = new PlotGenerator()
    this.amazonAPI = new AmazonAPI()
  }

  replaceByTemplate(template, ...args) {
    args.forEach((elem, index) => (template = template.replace("{0}", elem)))
    return template
  }

  getBalance(name) {
    let account = this.data.accounts.find((account) => (account.name === name))
    return account.balance
  }

  accountBalance(req) {
    let name = req.body.result.parameters.account
    let speech
    if (name) {
      let balance = this.getBalance(name)
      if (account) {
        let smile = account.balance > 0 ? " (y)" : " :("
        speech = this.replaceByTemplate(req.body.result.fulfillment.speech, account.name, balance, account.currency_code) + smile
      } else {
        speech = "Sorry, can't find such account! But You will rich it!"
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
    console.log("Show transactions between ", startDate, "and", endDate, "for", name)
    let account = this.data.accounts.find((account) => (account.name === name))
    if (!account) {
      return "No such account!";
    }
    let transactions = account.transactions
    let speech = "Transactions between date " + startDate + " and " + endDate + " are:\n"
    let bool = false
    transactions.forEach((transaction, i) => {
      if (moment(transaction.made_on).isAfter(moment(startDate)) && moment(transaction.made_on).isBefore(moment(endDate))) {
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
      if (moment(transaction.made_on).isSame(date)) {
        bool = true;
        speech += (i + 1) + ". " + transaction.amount + " " + transaction.currency_code + ", " + transaction.made_on + ", " + transaction.description + "\n"
      }
    });
    if (bool) {
      return speech
    }
    return "No transactions to be displayed!"
  }

  async speechParser(req) {
    let messages = []
    let object
    let intentName = req.body.result.metadata.intentName
    console.log(intentName);
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
      case "statistics pm":
        object = this.getPlot(this.getPeriod(req), req)
        break
      case "currency":
        object = this.getSpeechObject(this.currencyConvert(req), req)
        break
      case "currency exchange":
        object = this.getSpeechObject(this.getCurrency(req), req)
        break
      case "salary":
        object = this.getSpeechObject(this.whatIsMySalary(req), req)
      case "buy":
        let account = req.body.result.parameters.account
        let moneyAmount = 0
        if(req.body.result.parameters.account !== undefined &&
           this.checkAccount(account)) {
          if(req.result.resolvedQuery.includes("salary")) {
            moneyAmount = this.accountSalary(account)
          }
          else {
            moneyAmount = this.getBalance(accout)
          }
        } else {
          object = this.getSpeechObject("No such accout", req)
        }
        let response = await this.getThingsToBuy(moneyAmount)
        //console.log(response)
        object = this.parseAmazonResponse(response, req)
        console.log(object)
        break

        return this.parseAmazonResponse(response, req)
    }

    messages.push(object)

    return messages
  }

  getThingsToBuy(moneyAmount) {
    let response = this.amazonAPI.search(moneyAmount, 0)
    return response
  }

  parseAmazonResponse(response, req) {
    let messages = []
    let platform = this.getPlatform(req)
    for(var i = 0; i < response.length; i++) {
      messages.push({
        "platform": platform,
        "speech": response[i].DetailPageURL,
        "type": 0
      })
    }

    return messages
  }

  getPeriod(req) {
    let name = req.body.result.parameters.account
    let period = req.body.result.parameters.period
    let monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    let speech
    if (name) {
      let account = this.data.accounts.find((account) => (account.name === name))
      if (account) {
        let transactions = account.transactions
        if (monthNames.indexOf(period.toLowerCase()) === -1) {
          let monthsAmount = []
          let yearTransactions = transactions.filter((el) => {
            let year = new Date(el.made_on).getFullYear()
            return year == period
          })
          monthNames.forEach((obj, index) => {
            let monthAmount = transactions.filter((el) => (new Date(el.made_on).getMonth() == index))
              .reduce((sum, el) => (sum += el.amount), 0)
            monthsAmount.push(monthAmount)
          })

          return {
            x: monthNames,
            y: monthsAmount
          }
        } else {
          let days = []
          for (let i = 1; i <= this.daysInMonth(monthNames.indexOf(period) + 1); i++) {
            days.push(i)
          }
          let daysAmount = days
          let transactionsMonth = transactions.filter((el) => (new Date(el.made_on).getMonth() == monthNames.indexOf(period)))
          daysAmount = daysAmount.map((day) => {
            return transactionsMonth.filter((el) => (new Date(el.made_on).getDate() == day))
              .reduce((sum, el) => (sum += el.amount), 0)
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
    return new Date(new Date().getFullYear(), month, 0).getDate()
  }


  getPlatform(req) {
    if (req.body.originalRequest) {
      return req.body.originalRequest.source
    } else {
      return req.body.result.source
    }
  }

  getPlot(data, req) {
    let platform = this.getPlatform(req)
    return {
      imageUrl: this.plotGenerator.getImageUrl(data, req),
      platform: platform,
      type: 3
    }
  }

  currencyRequest() {
    return new Promise((resolve, reject) => {
      http.get('http://www.apilayer.net/api/live?access_key=fea2bfc061058a97b226296f0eede22f&format=1', (resp) => { 
        let data = ''
        resp.on('data', (chunk) => {  
          data += chunk;
        });
        resp.on('end', () => {  
          resolve(JSON.parse(data))
        });
      }).on("error", (err) => { 
        reject(err)
      });
    });
  }

  currencyConvert(req) {
    let name = req.body.result.parameters.account
    let currency1 = req.body.result.parameters.currency_name
    let currency_db = config.currency.quotes;
    let account = this.data.accounts.find((account) => (account.name === name))
    let balance = account.balance
    let currency2 = account.currency_code
    if (currency_db[currency1 + currency2]) {
      balance = balance / currency_db[currency1 + currency2]
    } else if (currency_db[currency2 + currency1]) {
      balance = balance * currency_db[currency2 + currency1]
    } else {
      balance = balance * (currency_db["USD" + currency1] / currency_db["USD" + currency2]);
    }
    let smile = balance > 0 ? " (y)" : " :("
    let speech = this.replaceByTemplate(req.body.result.fulfillment.speech, name, balance.toFixed(2), currency1) + smile
    return speech;
  }

  accountSalary(name) {
    let account = this.data.accounts.find((account) => (account.name === name))
    let transactions = account.transactions
    let sum = 0;
    let endDate = moment(transactions[0].made_on).add(1, 'month');
    transactions.forEach((transaction) => {
      if (moment(transaction.made_on).isBefore(endDate))
      if (transaction.amount > 0) {
        sum += transaction.amount;
      }
    });
    return sum;
  }

  checkAccount(name) {
    let account = this.data.accounts.find((account) => (account.name === name))
    if (!account) {
      return false
    }
  }

  whatIsMySalary(req) {
    let name = req.body.result.parameters.account
    let salary = this.accountSalary(name)
    let speech = this.replaceByTemplate(req.body.result.fulfillment.speech, salary.toFixed(2), account.currency_code)
    return speech;
  }

  getCurrency(req) {
    let currency1 = req.body.result.parameters.currency_name1
    let currency2 = req.body.result.parameters.currency_name2
    let currency_db = config.currency.quotes;
    if (currency_db[currency1 + currency2]) {
      return this.replaceByTemplate(req.body.result.fulfillment.speech, currency1, currency2, currency_db[currency1 + currency2].toFixed(2))
    } else if (currency_db[currency2 + currency1]) {
      return this.replaceByTemplate(req.body.result.fulfillment.speech, currency1, currency2, currency_db[currency2 + currency1].toFixed(2))
    } else {
      return this.replaceByTemplate(req.body.result.fulfillment.speech, currency1, currency2, currency_db["USD" + currency2] / currency_db["USD" + currency1].toFixed(2));
    }
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
