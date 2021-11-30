import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class updateRaptorsTable1638107126451 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('raptors', new TableColumn({
      name: 'period_id',
      type: 'varchar',
      length: '7',
      default: '2021-11'
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('raptors', 'period_id')
  }
}
