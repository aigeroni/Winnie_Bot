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
    'dist/src/models/**/*.js',
  ],
  'migrations': [
    'dist/src/db/migration/**/*.js',
  ],
  'cli': {
    'entitiesDir': 'src/models',
    'migrationsDir': 'db/migration',
  },
}
