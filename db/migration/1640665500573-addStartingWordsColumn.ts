import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class addStartingWordsColumn1640665500573 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('challenge_totals',
      new TableColumn({
        name: 'start_count',
        type: 'int',
        default: 0
      })
    )
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('challenge_totals', 'start_count')
  }
}
