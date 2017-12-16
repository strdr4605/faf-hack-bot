import express from 'express'
import Server from './server'
import bodyParser from 'body-parser'

let app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let server = new Server(app)
