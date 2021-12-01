import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm'

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
        length: '30',
        isNullable: true
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
      })
    ])

    const goalGuildForeignKey = new TableForeignKey({
      columnNames: ['guild_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'guild_config'
    })
    const goalOwnerForeignKey = new TableForeignKey({
      columnNames: ['owner_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user_config'
    })
    const goalProjectForeignKey = new TableForeignKey({
      columnNames: ['project_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'projects'
    })

    await queryRunner.createForeignKey('goals', goalGuildForeignKey)
    await queryRunner.createForeignKey('goals', goalOwnerForeignKey)
    await queryRunner.createForeignKey('goals', goalProjectForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    const goalsTable = await queryRunner.getTable('goals')
    const goalOwnerForeignKey = goalsTable?.foreignKeys.find(fk => fk.columnNames.includes('owner_id'))
    if (goalOwnerForeignKey != null) {
      await queryRunner.dropForeignKey('goals', goalOwnerForeignKey)
    }

    await queryRunner.dropColumns('goals', ['status', 'project_id', 'guild_id', 'period_id'])
  }
}
