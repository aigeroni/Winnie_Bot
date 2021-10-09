import { Job, Worker } from 'bullmq'
import { Logger, JobQueue } from '../core'
import { WinnieJob } from '../types'

export class BaseWorker {
  worker: Worker

  constructor (queueName: string, jobTypes: WinnieJob[]) {
    this.worker = new Worker(queueName, this.handleJob(jobTypes), {
      connection: JobQueue.connectionOptions
    })

    this.worker.on('failed', (job, error) => {
      Logger.error(`Failed job ${job.id ?? ''} with ${error.message}`)
    })
  }

  gracefulShutdown (): void {
    Logger.info('Stopping worker...')

    this.worker.close().then(() => {
      process.exit()
    }).catch(() => {
      process.exit()
    })
  }

  private handleJob (jobTypes: WinnieJob[]) {
    return async (job: Job) => {
      Logger.info(`Processing job: ${job.name}`)

      const jobType = jobTypes.find((j) => j.name === job.name)

      await jobType?.execute(job)
    }
  }
}
