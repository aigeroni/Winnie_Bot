import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createChainsTable1638107137532 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const chainsTable = new Table({
      name: 'chain_wars',
      columns: [
        /**
         * The ID of the chain war.
         *
         * Primary key, auto-incrementing.
         */
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        /**
         * The chain war's name.
         *
         * Used in challenge lists.
         */
        {
          name: 'name',
          type: 'varchar',
          length: '150'
        },
        /**
         * Whether or not wars in the chain should show up in challenge lists.
         */
        {
          name: 'is_visible',
          type: 'boolean'
        },
        /**
         * When the first war in the chain should start.
         */
        {
          name: 'start_at',
          type: 'varchar'
        },
        /**
         * The current status of the chain.
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
         * How long each war should last, in minutes.
         *
         * default = 10
         */
        {
          name: 'duration',
          type: 'int',
          default: 10
        },
        /**
         * The total number of wars in the chain.
         */
        {
          name: 'number_of_wars',
          type: 'int'
        },
        /**
         * The amount of time, in minutes, between the end of one war
         * and the beginning of the next.
         *
         * default = 5
         */
        {
          name: 'war_margin',
          type: 'int',
          default: 5
        },
        /**
         * The list of channels that wars in the chain print to.
         */
        {
          name: 'channels',
          type: 'varchar',
          isArray: true
        },
        /**
         * Timestamp of when this chain was created.
         */
        {
          name: 'created_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of the most recent update to the chain.
         *
         * Null if never updated.
         */
        {
          name: 'updated_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of when this chain was canceled.
         *
         * Null if not canceled.
         */
        {
          name: 'canceled_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of when this chain was completed.
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

    await queryRunner.createTable(chainsTable, true)

    const chainGuildForeignKey = new TableForeignKey({
      columnNames: ['guild_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'guild_config'
    })
    const chainOwnerForeignKey = new TableForeignKey({
      columnNames: ['owner_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user_config'
    })

    await queryRunner.createForeignKey('chain_wars', chainGuildForeignKey)
    await queryRunner.createForeignKey('chain_wars', chainOwnerForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chains')
  }
}
