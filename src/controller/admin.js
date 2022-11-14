const { Op } = require('sequelize')
const { JOB_STATUS_PAID } = require('../constants')

async function getBestProfession (req, res) {
  const { Profile, Job, Contract } = req.app.get('models')
  const { start, end } = req.query
  // eslint-disable-next-line func-call-spacing
  const result = {}

  // eslint-disable-next-line no-unexpected-multiline
  (await Job.findAll({ where: { paid: JOB_STATUS_PAID, createdAt: { [Op.between]: [start, end] } }, include: { model: Contract, required: true, include: { model: Profile, required: true, as: 'Client' } } }))
    .forEach(element => {
      result[element.Contract.Client.profession]
        ? result[element.Contract.Client.profession] += element.price
        : result[element.Contract.Client.profession] = element.price
    })

  if (Object.keys(result).length) {
    return res.json({ profession: Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b) })
  }
  res.end('No one job found')
}

async function getBestClients (req, res) {
  const { Profile, Job, Contract } = req.app.get('models')
  const { start, end, limit = 2 } = req.query
  // eslint-disable-next-line func-call-spacing
  const result = {}

  // eslint-disable-next-line no-unexpected-multiline
  (await Job.findAll({ where: { paid: JOB_STATUS_PAID, createdAt: { [Op.between]: [start, end] } }, include: { model: Contract, required: true, include: { model: Profile, required: true, as: 'Client' } } }))
    .forEach(element => {
      result[element.Contract.Client.id]
        ? result[element.Contract.Client.id].price += element.price
        : result[element.Contract.Client.id] = { id: element.Contract.Client.id, fullName: `${element.Contract.Client.firstName} ${element.Contract.Client.lastName}`, price: element.price }
    })

  res.json((Object.values(result).sort((a, b) => b.price - a.price)).slice(0, limit))
}

module.exports = {
  getBestProfession,
  getBestClients
}
