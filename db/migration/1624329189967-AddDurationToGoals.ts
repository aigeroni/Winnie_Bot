import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddDurationToGoals1624329189967 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('goals', new TableColumn({
      name: 'duration',
      type: 'enum',
      enum: ['daily', 'monthly', 'weekly', 'yearly'],
      isNullable: false
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('goals', 'duration')
  }
}
