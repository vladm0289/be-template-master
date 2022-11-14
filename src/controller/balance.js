const { JOB_STATUS_PAID } = require('../constants')

async function applyClientDeposit (req, res) {
  const { Job, Contract } = req.app.get('models')

  const { amount } = req.body

  if (!amount) {
    return res.status(404).end('Amount is mandatory')
  }

  const totalJobsAmount = (await Job.findAll({ where: { paid: JOB_STATUS_PAID }, include: { model: Contract, where: { ClientId: req.profile.id }, required: true } }))
    // eslint-disable-next-line no-return-assign
    .reduce((prev, current) => prev += current.price, 0)

  if (amount > (parseFloat(totalJobsAmount * 0.25))) {
    res.status(404).end('Decresase amount!')
  }

  req.profile.balance = req.profile.balance + amount
  await req.profile.save()

  res.end()
}

module.exports = {
  applyClientDeposit
}
