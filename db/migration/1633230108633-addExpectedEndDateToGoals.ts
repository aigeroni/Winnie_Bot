import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class addExpectedEndDateToGoals1633230108633 implements MigrationInterface {
  name = 'addExpectedEndDateToGoals1633230108633'

  public async up (queryRunner: QueryRunner): Promise<void> {
    /**
   * The anticipated time the goal will end, based on the creation time.
   */
    await queryRunner.addColumn('goals', new TableColumn({
      name: 'expected_end_at',
      type: 'varchar',
      isNullable: true
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('goals', 'expected_end_at')
  }
}
