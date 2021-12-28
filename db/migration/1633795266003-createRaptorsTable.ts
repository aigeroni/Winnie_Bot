import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createRaptorsTable1633795266003 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const raptorsTable = new Table({
      name: 'raptors',
      columns: [
        /**
         * The guild in which these raptors have been earned.
         *
         * Part of the table's primary key, along with userId and period.
         */
        {
          name: 'guild_id',
          type: 'varchar',
          length: '30',
          isPrimary: true,
          isNullable: false
        },
        /**
         * The user that earned these raptors.
         *
         * Part of the table's primary key, along with guildId and period.
         */
        {
          name: 'user_id',
          type: 'varchar',
          length: '30',
          isPrimary: true,
          isNullable: false
        },
        /**
         * The number of white raptors this user has earned in this server for a given time period
         *
         * Awarded for completing daily goals.
         */
        {
          name: 'white_raptors',
          type: 'int',
          default: 0
        },
        /**
         * The number of green raptors this user has earned in this server for a given time period
         *
         * Awarded for completing challenges.
         */
        {
          name: 'green_raptors',
          type: 'int',
          default: 0
        },
        /**
         * The number of blue raptors this user has earned in this server for a given time period
         *
         * Awarded for completing weekly goals.
         */
        {
          name: 'blue_raptors',
          type: 'int',
          default: 0
        },
        /**
         * The number of purple raptors this user has earned in this server for a given time period
         *
         * Awarded for completing monthly goals.
         */
        {
          name: 'purple_raptors',
          type: 'int',
          default: 0
        },
        /**
         * The number of orange raptors this user has earned in this server for a given time period
         *
         * Awarded for completing yearly goals.
         */
        {
          name: 'orange_raptors',
          type: 'int',
          default: 0
        }
      ]
    })

    await queryRunner.createTable(raptorsTable, true)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('raptors')
  }
}
