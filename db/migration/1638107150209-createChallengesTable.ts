import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createChallengesTable1638107150209 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const challengesTable = new Table({
      name: 'challenges',
      columns: [
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        /**
         * The challenge's name.
         *
         * Used in challenge lists.
         */
        {
          name: 'name',
          type: 'varchar',
          length: '150'
        },
        /**
         * Whether or not the challenge should show up in challenge lists.
         */
        {
          name: 'is_visible',
          type: 'boolean'
        },
        /**
         * When the challenge should start.
         */
        {
          name: 'start_at',
          type: 'varchar'
        },
        /**
         * The current status of the mission.
         *
         * Can be Created, Running, Completed, or Canceled.
         */
        {
          name: 'status',
          type: 'enum',
          enum: ['created', 'running', 'canceled', 'completed']
        },
        /**
         * The id of the guild that the mission belongs to.
         */
        {
          name: 'guild_id',
          type: 'varchar',
          length: '30'
        },
        /**
         * The id of the user that created the mission.
         */
        {
          name: 'owner_id',
          type: 'varchar',
          length: '30'
        },
        /**
         * The amount of time, in minutes, that the challenge will be visible in lists.
         *
         * Once a war's duration is up, it ends, and users can post totals.
         * Races continue for another 60 minutes, to allow users to complete the race.
         * Race default = 30 minutes
         * War default = 10 minutes
         */
        {
          name: 'duration',
          type: 'int'
        },
        /**
         * The target for the challenge. Only applicable to races.
         *
         * example: 5 pages
         */
        {
          name: 'target',
          type: 'int',
          isNullable: true
        },
        /**
         * The type of goal for which entrants are aiming. Only applicable to races.
         *
         * Can be one of pages, words, minutes, lines, or items.
         */
        {
          name: 'target_type',
          type: 'enum',
          enum: ['items', 'lines', 'minutes', 'pages', 'words'],
          isNullable: true
        },
        /**
         * The chain war this challenge is a part of. Only applicable to wars.
         *
         * Null if the war is not part of a chain war.
         */
        {
          name: 'chain_war_id',
          type: 'int',
          isNullable: true
        },
        /**
         * The list of channels that the challenge prints to.
         */
        {
          name: 'channels',
          type: 'varchar',
          isArray: true
        },
        /**
         * The type of the challenge; either war or race.
         */
        {
          name: 'challenge_type',
          type: 'enum',
          enum: ['war', 'race']
        },
        /**
         * Timestamp of when this mission was created.
         */
        {
          name: 'created_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of the most recent update to the mission.
         *
         * Null if never updated.
         */
        {
          name: 'updated_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of when this mission was canceled.
         *
         * Null if not canceled.
         */
        {
          name: 'canceled_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of when this mission was completed.
         *
         * Null if not completed.
         */
        {
          name: 'completed_at',
          type: 'varchar',
          isNullable: true
        }
      ]
    })

    await queryRunner.createTable(challengesTable, true)

    const challengeGuildForeignKey = new TableForeignKey({
      columnNames: ['guild_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'guild_config'
    })
    const challengeOwnerForeignKey = new TableForeignKey({
      columnNames: ['owner_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user_config'
    })
    const challengeChainForeignKey = new TableForeignKey({
      columnNames: ['chain_war_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'chain_wars'
    })

    await queryRunner.createForeignKey('challenges', challengeGuildForeignKey)
    await queryRunner.createForeignKey('challenges', challengeOwnerForeignKey)
    await queryRunner.createForeignKey('challenges', challengeChainForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenges')
  }
}
