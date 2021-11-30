import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class updateGoalsTable1638107109254 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('goals', [
      new TableColumn({
        name: 'period_id',
        type: 'varchar',
        length: '7',
        default: '2021-11'
      }),
      new TableColumn({
        name: 'guild_id',
        type: 'varchar',
        length: '30'
      }),
      new TableColumn({
        name: 'project_id',
        type: 'int',
        isNullable: true
      }),
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['created', 'canceled', 'completed'],
        isNullable: true
      }),
    ])
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('goals', 'expected_end_at')
  }
}
