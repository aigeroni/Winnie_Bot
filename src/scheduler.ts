import { DateTime } from 'luxon'
import NodeCron from 'node-cron'
import { Jobs } from './jobs'

function scheduleEnququeGoalsToCompleteJob (): void {
  NodeCron.schedule('*/15 * * * *', () => {
    Jobs.goalJobs.EnququeGoalsToCompleteJob.enqueue({ time: DateTime.utc().toISO() }).catch(() => {})
  })
}

export function scheduleJobs (): void {
  scheduleEnququeGoalsToCompleteJob()
}
