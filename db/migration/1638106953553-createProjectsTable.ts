import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createProjectsTable1638106953553 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const projectsTable = new Table({
      name: 'projects',
      columns: [
        /**
         * The ID of the project.
         *
         * Primary key, auto-incrementing.
         */
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        /**
         * The project's name, used in project views.
         */
        {
          name: 'name',
          type: 'varchar',
          length: '150'
        },
        /**
         * The target for the project.
         *
         * example: 80000 words, 400 pages
         */
        {
          name: 'target',
          type: 'int'
        },
        /**
         * The type of goal for which the user is aiming for this project.
         *
         * Can be one of pages, words, minutes, lines, or items
         */
        {
          name: 'target_type',
          type: 'enum',
          enum: ['items', 'lines', 'minutes', 'pages', 'words']
        },
        /**
         * The progress towards completing the project.
         *
         * example: 73 out of 120 pages
         */
        {
          name: 'progress',
          type: 'int'
        },
        /**
         * The current status of the project.  Can be Created, Running (for challenges only), Completed, or Canceled.
         */
        {
          name: 'status',
          type: 'enum',
          enum: ['created', 'canceled', 'completed']
        },
        /**
         * The id of the guild that the project belongs to.
         */
        {
          name: 'guild_id',
          type: 'varchar',
          length: '30'
        },
        /**
         * The id of the user that created the project.
         */
        {
          name: 'owner_id',
          type: 'varchar',
          length: '30'
        },
        /**
         * The id of the channel in which the project was created.
         *
         * Used for sending messages about the project's status later.
         */
        {
          name: 'channel_id',
          type: 'varchar',
          length: '30'
        },
        /**
         * Timestamp of when this project was created.
         */
        {
          name: 'created_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of the most recent update to the project.
         *
         * Null if never updated.
         */
        {
          name: 'updated_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of when this project was canceled.
         *
         * Null if not canceled.
         */
        {
          name: 'canceled_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * Timestamp of when this project was completed.
         *
         * Null if not completed.
         */
        {
          name: 'completed_at',
          type: 'varchar',
          isNullable: true
        },
        /**
         * The due date of the project.
         */
        {
          name: 'due_at',
          type: 'varchar',
          isNullable: true
        }
      ]
    })

    await queryRunner.createTable(projectsTable, true)

    const projectGuildForeignKey = new TableForeignKey({
      columnNames: ['guild_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'guild_config'
    })
    const projectOwnerForeignKey = new TableForeignKey({
      columnNames: ['owner_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user_config'
    })

    await queryRunner.createForeignKey('projects', projectGuildForeignKey)
    await queryRunner.createForeignKey('projects', projectOwnerForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('projects')
  }
}
