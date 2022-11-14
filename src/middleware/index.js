const { PROFILE_TYPE_CLIENT } = require('../constants/index')

const getProfile = async (req, res, next) => {
  const { Profile } = req.app.get('models')

  const profile = await Profile.findOne({ where: { id: req.get('profile_id') || 0 } })
  if (!profile) return res.status(401).end()
  req.profile = profile

  req.conditionByProfileType = req.profile.type === PROFILE_TYPE_CLIENT
    ? { ClientId: profile.id }
    : { ContractorId: profile.id }

  next()
}

const onlyClientType = async (req, res, next) => {
  if (req.profile.type !== PROFILE_TYPE_CLIENT) return res.status(403).end()

  next()
}

module.exports = {
  getProfile,
  onlyClientType
}
