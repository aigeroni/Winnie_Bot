import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createGuildConfigTable1606546432078 implements MigrationInterface {
  name = 'createGuildConfigTable1606546432078'

  public async up (queryRunner: QueryRunner): Promise<void> {
    const guildConfigTable = new Table({
      name: 'guild_config',
      columns: [
        /**
         * The Discord ID of the guild this configuration object represents.
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
         * The prefix of Winnie's bot commands in this guild.
         */
        {
          name: 'prefix',
          type: 'varchar',
          length: '3',
          isNullable: false
        },
        /**
         * The Discord ID of the channel in which announcements should be sent.
         *
         * Channel where Winnie sends announcements and raptors for users with a home guild set.
         */
        {
          name: 'announcements_channel_id',
          type: 'varchar',
          length: '30',
          isNullable: true
        },
        /**
         * Whether or not challenges created in this guild are automatically hidden
         */
        {
          name: 'cross_guild',
          type: 'boolean',
          isNullable: false,
          default: true
        },
        /**
         * The locale to use for messages sent to this guild
         */
        {
          name: 'locale',
          type: 'varchar',
          length: '2',
          isNullable: false
        },
        /**
         * A default timezone for the guild.
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
        }
      ]
    })

    await queryRunner.createTable(guildConfigTable, true)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('guild_config')
  }
}
