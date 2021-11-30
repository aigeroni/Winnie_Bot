import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createPeriodConfigTable1638106941492 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const periodConfigTable = new Table({
      name: 'period_config',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          length: '7'
        },
        {
          name: 'year',
          type: 'int'
        },
        {
          name: 'month',
          type: 'int'
        },
        {
          name: 'period_text',
          type: 'varchar',
          length: '20'
        },
        {
          name: 'period_note',
          type: 'varchar',
          length: '150',
          isNullable: true
        }
      ]
    })

    await queryRunner.createTable(periodConfigTable, true)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('period_config')
  }
}
