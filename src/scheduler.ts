import { DateTime } from 'luxon'
import NodeCron from 'node-cron'
import { Jobs } from './jobs'

function scheduleEnqueueGoalsToCompleteJob (): void {
  NodeCron.schedule('*/15 * * * *', () => {
    Jobs.goalJobs.EnqueueGoalsToCompleteJob.enqueue({ time: DateTime.utc().toISO() }).catch(() => {})
  })
}

export function scheduleJobs (): void {
  scheduleEnqueueGoalsToCompleteJob()
}
