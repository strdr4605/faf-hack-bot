import config from './config'

export default class IntentsProcessing {
  constructor() {
    this.data = config.accountData.data
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
    let intentName = req.body.result.metadata.intentName
    switch (intentName) {
      case "actual-balance":
        return this.accountBalance(req)
        break
      case "last x transaction":
        return this.lastXTransactions(req)
        break
      case "transaction between":
        return this.transactionsBetween(req)
        break
      case "transaction on":
        return this.transactionsOn(req)
        break
    }
  }

  imageParser(req) {
    let intentName = req.body.result.metadata.intentName
  }
}
