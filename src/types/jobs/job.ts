import { Job } from 'bullmq'

export interface WinnieJob<T = any> {
  name: string
  enqueue: (data: T) => Promise<void>
  execute: (job: Job<T>) => Promise<void>
}
