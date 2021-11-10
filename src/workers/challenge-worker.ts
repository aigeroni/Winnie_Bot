import { BaseWorker } from './base-worker'
import { JobQueue } from '../core'
import { Jobs } from '../jobs'
import { createConnection } from 'typeorm'

createConnection().then(() => {
  const worker = new BaseWorker(JobQueue.queueNames.challenges, Jobs.challengeJobs.all)
  process.on('SIGTERM', () => worker.gracefulShutdown())
  process.on('SIGINT', () => worker.gracefulShutdown())
}).catch(() => {})
