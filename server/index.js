import express from 'express'
import Server from './server'

let app = express()

let server = new Server(app)
