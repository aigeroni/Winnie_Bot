import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class addFinishTimeToChallengeUsers1635828093251 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('challenge_user', new TableColumn({
      name: 'finished_at',
      type: 'varchar',
      isNullable: true
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('challenge_user', 'finished_at')
  }
}
