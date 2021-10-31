import { Queue } from 'bullmq'

export const redisConnectionOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT != null ? parseInt(process.env.REDIS_PORT) : 0,
  password: process.env.REDIS_PASSWORD
}

export const queueNames = {
  goals: 'goals_queue',
  challenges: 'challenges_queue'
}

const goalsQueue = new Queue(queueNames.goals, {
  connection: redisConnectionOptions
})

const challengesQueue = new Queue(queueNames.challenges, {
  connection: redisConnectionOptions
})

export const JobQueue = {
  queues: {
    goalsQueue,
    challengesQueue
  },
  queueNames,
  connectionOptions: redisConnectionOptions
}
