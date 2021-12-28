import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createGoalsTable1627451784152 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const goalTable = new Table({
      name: 'goals',
      columns: [
        /**
         * The ID of the goal.
         * 
         * Primary key, auto-incrementing.
         */
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        /**
         * The target for the goal.
         *
         * example: 5 pages
         */
        {
          name: 'target',
          type: 'int'
        },
        /**
         * The type of goal for which the user is aiming.
         *
         * Can be one of pages, words, minutes, lines, or items
         */
        {
          name: 'goal_type',
          type: 'enum',
          enum: ['items', 'lines', 'minutes', 'pages', 'words']
        },
        /**
         * The goals duration, how long the user has to complete their goal.
         *
         * Can be one of daily, monthly, weekly, or yearly (currently database-level enum)
         */
        {
          name: 'goal_duration',
          type: 'enum',
          enum: ['daily', 'monthly', 'weekly', 'yearly'],
          isNullable: false
        },
        /**
         * The progress towards completing the goal.
         *
         * example: 3 out of 5 pages
         */
        {
          name: 'progress',
          type: 'int'
        },
        /**
         * The id of the user that created the goal.
         */
        {
          name: 'owner_id',
          type: 'varchar',
          length: '30'
        },
        /**
         * The id of the channel in which the goal was set.
         *
         * Used for sending messages about the goal's status later.
         */
        {
          name: 'channel_id',
          type: 'varchar',
          length: '30'
        },
        /**
         * Timestamp of when the goal was created.
         */
        {
          name: 'created_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of the most recent update to the goal.
         *
         * Null if never updated.
         */
        {
          name: 'updated_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of when the goal was canceled.
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
         * Null if not completed
         */
        {
          name: 'completed_at',
          type: 'varchar',
          isNullable: true
        }
      ]
    })

    await queryRunner.createTable(goalTable, true)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('goals')
  }
}
