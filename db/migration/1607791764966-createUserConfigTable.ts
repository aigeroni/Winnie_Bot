import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createUserConfigTable1607791764966 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const userConfigTable = new Table({
      name: 'user_config',
      columns: [
        /**
         * The Discord ID of the user this configuration object represents.
         */
        {
          name: 'id',
          type: 'varchar',
          length: '30',
          isPrimary: true,
          isUnique: true,
          isNullable: false
        },
        /**
         * The timezone the user is in, used for hatching raptors.
         *
         * Takes the format of an IANA timezone identifier, examples:
         * America/Winnipeg
         * Australia/Perth
         * Europe/Zurich
         */
        {
          name: 'timezone',
          type: 'varchar',
          length: '45',
          isNullable: true
        },
        /**
         * Whether or not challenges created by this user are automatically hidden.
         *
         * Can be overridden by GuildConfig#crossGuild
         */
        {
          name: 'cross_guild',
          type: 'boolean',
          isNullable: false,
          default: true
        }
      ]
    })

    await queryRunner.createTable(userConfigTable, true)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_config')
  }
}
