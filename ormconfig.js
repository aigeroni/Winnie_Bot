/* eslint no-undef: 0 */
module.exports = {
  type: 'postgres',
  url: process.env.POSTGRES_CONNECTION_STRING,
  synchronize: false,
  logging: true,
  entities: [
    'dist/src/models/**/*.js'
  ],
  migrations: [
    'dist/db/migration/**/*.js'
  ],
  cli: {
    entitiesDir: 'src/models',
    migrationsDir: 'db/migration'
  }
}
