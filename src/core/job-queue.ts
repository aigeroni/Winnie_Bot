import { Queue, QueueScheduler } from 'bullmq'

export const redisConnectionOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT != null ? parseInt(process.env.REDIS_PORT) : 0,
  password: process.env.REDIS_PASSWORD
}

export const queueNames = {
  goals: 'goals_queue',
  challenges: 'challenges_queue',
  challengesScheduler: 'challenges_queue_scheduler'
}

const goalsQueue = new Queue(queueNames.goals, {
  connection: redisConnectionOptions
})

const challengesQueue = new Queue(queueNames.challenges, {
  connection: redisConnectionOptions
})

const challengesQueueScheduler = new QueueScheduler(queueNames.challengesScheduler, {
  connection: redisConnectionOptions
})

export const JobQueue = {
  queues: {
    goalsQueue,
    challengesQueue,
    challengesQueueScheduler
  },
  queueNames,
  connectionOptions: redisConnectionOptions
}
