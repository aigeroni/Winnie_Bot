import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createPeriodConfigTable1638106941492 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const periodConfigTable = new Table({
      name: 'period_config',
      columns: [
        /**
         * The ID of the period (in yyyy-mm format)
         */
        {
          name: 'id',
          type: 'varchar',
          length: '7',
          isPrimary: true
        },
        /**
         * The year of the period.
         */
        {
          name: 'year',
          type: 'int',
          isPrimary: true
        },
        /**
         * The month of the period.
         */
        {
          name: 'month',
          type: 'int',
          isPrimary: true
        },
        /**
         * A text string describing the period.
         */
        {
          name: 'period_text',
          type: 'varchar',
          length: '20'
        },
        /**
         * A text string describing any abnormal events during the period.
         *
         * This can include outages, data loss, or configuration changes.
         */
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
