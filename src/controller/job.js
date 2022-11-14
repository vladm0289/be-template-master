const { sequelize } = require('../model')
const { CONTRACT_STATUS_IN_PROGRESS, JOB_STATUS_UNPAID, PROFILE_TYPE_CONTRACTOR } = require('../constants')

async function getUnpaidJobsByProfile (req, res) {
  const { Contract, Job } = req.app.get('models')

  const jobs = await Job.findAll({
    where: { paid: JOB_STATUS_UNPAID },
    include: {
      model: Contract,
      where: {
        ...req.conditionByProfileType,
        status: CONTRACT_STATUS_IN_PROGRESS
      },
      required: true
    }
  })
  if (!jobs) return res.status(404).end()
  res.json(jobs)
}

async function jobPayProcessing (req, res) {
  const t = await sequelize.transaction()
  try {
    const { Profile, Job, Contract } = req.app.get('models')

    const { job_id: jobId } = req.params

    if (!jobId || !Number(jobId)) return res.status(404).end('Job must be a number')

    const job = await Job.findOne({ where: { id: jobId }, include: { model: Contract, where: { ClientId: req.profile.id }, required: true } })

    if (!job) return res.status(404).end('Warning!!! It\'s not you job.')

    if (req.profile.balance < job.price) {
      return res.status(404).end('Insufficient funds')
    }

    req.profile.balance = req.profile.balance - job.price
    await req.profile.save({ transaction: t })

    const contractor = await Profile.findOne({ where: { id: job.Contract.ContractorId, type: PROFILE_TYPE_CONTRACTOR } })

    if (!contractor) {
      throw new Error('Contractor not found')
    }

    contractor.balance = contractor.balance + job.price
    await contractor.save({ transaction: t })

    await t.commit()

    res.json(job)
  } catch (err) {
    await t.rollback()
    res.status(500).end()
  }
}

module.exports = {
  getUnpaidJobsByProfile,
  jobPayProcessing
}
