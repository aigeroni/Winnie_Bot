import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createChallengeTotalsTable1638107169726 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const challengeTotalsTable = new Table({
      name: 'challenge_totals',
      columns: [
        /**
         * The challenge to which the user is joined.
         *
         * Part of the primary key, along with userId
         */
        {
          name: 'challenge_id',
          type: 'int',
          isPrimary: true
        },
        /**
         * The user's discord ID.
         *
         * Part of the primary key, along with the challenge ID.
         */
        {
          name: 'user_id',
          type: 'varchar',
          length: '30',
          isPrimary: true
        },
        /**
         * The guild from which the user joined the challenge.
         */
        {
          name: 'guild_id',
          type: 'varchar',
          length: '30'
        },
        /**
         * The user's total for the challenge.
         */
        {
          name: 'total',
          type: 'int',
          default: 0
        },
        /**
         * The type of the total.
         *
         * Can be items, lines, minutes, pages, or words.
         */
        {
          name: 'total_type',
          type: 'enum',
          enum: ['items', 'lines', 'minutes', 'pages', 'words']
        },
        /**
         * The chain that the joined challenge is part of, if any.
         */
        {
          name: 'chain_war_id',
          type: 'int',
          isNullable: true
        },
        /**
         * The id of the channel from which the user joined the challenge.
         *
         * Used to construct pings.
         */
        {
          name: 'channel_id',
          type: 'varchar',
          length: '30'
        },
        /**
         * The id of the project that the total is associated with.
         */
        {
          name: 'project_id',
          type: 'int',
          isNullable: true
        }
      ]
    })

    await queryRunner.createTable(challengeTotalsTable, true)

    const ctGuildForeignKey = new TableForeignKey({
      columnNames: ['guild_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'guild_config'
    })
    const ctUserForeignKey = new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user_config'
    })
    const ctChallengeForeignKey = new TableForeignKey({
      columnNames: ['challenge_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'challenges'
    })
    const ctChainForeignKey = new TableForeignKey({
      columnNames: ['chain_war_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'chain_wars'
    })
    const ctProjectForeignKey = new TableForeignKey({
      columnNames: ['project_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'projects'
    })

    await queryRunner.createForeignKey('challenge_totals', ctGuildForeignKey)
    await queryRunner.createForeignKey('challenge_totals', ctUserForeignKey)
    await queryRunner.createForeignKey('challenge_totals', ctChallengeForeignKey)
    await queryRunner.createForeignKey('challenge_totals', ctChainForeignKey)
    await queryRunner.createForeignKey('challenge_totals', ctProjectForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenge_totals')
  }
}
