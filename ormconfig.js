/* eslint no-undef: 0 */
module.exports = {
  'type': 'postgres',
  'host': 'localhost',
  'port': 5432,
  'username': process.env.POSTGRES_USER,
  'password': process.env.POSTGRES_PASSWORD,
  'database': process.env.POSTGRES_DB,
  'synchronize': false,
  'logging': true,
  'entities': [
    'src/models/**/*.ts',
  ],
  'migrations': [
    'db/migration/**/*.ts',
  ],
  'subscribers': [
    'src/subscriber/**/*.ts',
  ],
  'cli': {
    'entitiesDir': 'src/models',
    'migrationsDir': 'db/migration',
    'subscribersDir': 'src/subscriber',
  },
}
