import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createGoalsTable1627451784152 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const goalTable = new Table({
      name: 'goals',
      columns: [
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        {
          name: 'target',
          type: 'int'
        },
        {
          name: 'goal_type',
          type: 'enum',
          enum: ['items', 'lines', 'minutes', 'pages', 'words']
        },
        {
          name: 'goal_duration',
          type: 'enum',
          enum: ['daily', 'monthly', 'weekly', 'yearly'],
          isNullable: false
        },
        {
          name: 'progress',
          type: 'int'
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
        }
      ]
    })

    await queryRunner.createTable(goalTable, true)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('goals')
  }
}
