import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class addCancelledDateToChallengeUser1635820131141 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('challenge_users', new TableColumn({
      name: 'canceled_at',
      type: 'varchar',
      isNullable: true
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('challenge_users', 'canceled_at')
  }
}
