import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createProjectsTable1638106953553 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const projectsTable = new Table({
      name: 'projects',
      columns: [
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        {
          name: 'name',
          type: 'varchar',
          length: '150'
        },
        {
          name: 'target',
          type: 'int'
        },
        {
          name: 'target_type',
          type: 'enum',
          enum: ['items', 'lines', 'minutes', 'pages', 'words']
        },
        {
          name: 'progress',
          type: 'int'
        },
        {
          name: 'status',
          type: 'enum',
          enum: ['created', 'canceled', 'completed']
        },
        {
          name: 'guild_id',
          type: 'varchar',
          length: '30'
        },
        {
          name: 'owner_id',
          type: 'varchar',
          length: '30'
        },
        {
          name: 'channel_id',
          type: 'varchar',
          length: '30'
        },
        {
          name: 'created_at',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'updated_at',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'canceled_at',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'completed_at',
          type: 'varchar',
          isNullable: true
        },
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
