import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class addCancelledDateToChallengeUser1635820131141 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('challenge_users', new TableColumn({
      name: 'cancelled_at',
      type: 'varchar',
      isNullable: true
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('challenge_user', 'cancelled_at')
  }
}
