const express = require('express')
const bodyParser = require('body-parser')
const { sequelize } = require('./model')
const { getProfile, onlyClientType } = require('./middleware')

const app = express()
app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const { adminCtrl, balanceCtrl, jobCtrl, contractCtrl } = require('./controller')

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, contractCtrl.getContractsById)

app.get('/contracts', getProfile, contractCtrl.getContractListByProfile)

app.get('/jobs/unpaid', getProfile, jobCtrl.getUnpaidJobsByProfile)

app.post('/jobs/:job_id/pay', getProfile, onlyClientType, jobCtrl.jobPayProcessing)

app.post('/balances/deposit', getProfile, onlyClientType, balanceCtrl.applyClientDeposit)

app.get('/admin/best-profession', adminCtrl.getBestProfession)

app.get('/admin/best-client', adminCtrl.getBestClients)

module.exports = app
