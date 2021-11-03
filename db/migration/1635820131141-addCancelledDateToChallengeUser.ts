import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class addCancelledDateToChallengeUser implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('challenge_user', new TableColumn({
      name: 'cancelled_at',
      type: 'varchar',
      isNullable: true
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('challenge_user', 'cancelled_at')
  }
}
