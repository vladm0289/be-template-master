async function getContractListByProfile (req, res) {
  const { Contract } = req.app.get('models')

  const contract = await Contract.findAll({ where: req.conditionByProfileType })

  if (!contract) return res.status(404).end()

  res.json(contract)
}

async function getContractsById (req, res) {
  const { Contract } = req.app.get('models')

  const contract = await Contract.findOne({ where: { id: req.params.id, ...req.conditionByProfileType } })

  if (!contract) return res.status(404).end()

  res.json(contract)
}

module.exports = {
  getContractListByProfile,
  getContractsById
}
