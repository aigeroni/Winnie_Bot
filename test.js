
console.log('test')
console.log('pwd: ' + process.env.pwd)

// console.log(require('dotenv').config({
// debug: process.env.DEBUG
// }))

if (process.env.POSTGRES_CONNECTION_STRING !== '') {
  console.log('POSTGRES_CONNECTION_STRING exists')
}

if (process.env.TYPEORM_URL !== '') {
  console.log('TYPEORM_URL exists')
}

if (process.env.TYPEORM_ENTITIES !== '') {
  console.log('TYPEORM_ENTITIES exists: ' + process.env.TYPEORM_ENTITIES)
}

if (process.env.TYPEORM_ENTITIES_DIR !== '') {
  console.log('TYPEORM_ENTITIES_DIR exists: ' + process.env.TYPEORM_ENTITIES_DIR)
}

if (process.env.TYPEORM_MIGRATIONS !== '') {
  console.log('TYPEORM_MIGRATIONS exists: ' + process.env.TYPEORM_MIGRATIONS)
}

if (process.env.TYPEORM_MIGRATIONS_DIR !== '') {
  console.log('TYPEORM_MIGRATIONS_DIR exists: ' + process.env.TYPEORM_MIGRATIONS_DIR)
}

if (process.env.REDIS_HOST !== '') {
  console.log('REDIS_HOST exists: ' + process.env.REDIS_HOST)
}

if (process.env.REDIS_PORT !== '') {
  console.log('REDIS_PORT exists')
}

if (process.env.BOT_TOKEN !== '') {
  console.log('BOT_TOKEN exists')
}

if (process.env.NODE_ENV !== '') {
  console.log('NODE_ENV exists: ' + process.env.NODE_ENV)
}
