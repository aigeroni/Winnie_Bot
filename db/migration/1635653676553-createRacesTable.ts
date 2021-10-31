import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createRacesTable1635653676553 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const racesTable = new Table({
      name: 'races',
      columns: [
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },

        {
          name: 'name',
          type: 'varchar',
          length: '150',
          isNullable: false
        },
        {
          name: 'is_visible',
          type: 'boolean'
        },
        {
          name: 'start_at',
          type: 'varchar',
          isNullable: false
        },
        {
          name: 'has_started',
          type: 'boolean'
        },
        {
          name: 'created_by',
          type: 'varchar',
          length: '30'
        },

        {
          name: 'target',
          type: 'int'
        },
        {
          name: 'target_type',
          type: 'enum',
          enum: ['items', 'lines', 'minutes', 'pages', 'words']
        },
        {
          name: 'time_out',
          type: 'int',
          isNullable: false
        },

        {
          name: 'created_at',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'updated_at',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'canceled_at',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'completed_at',
          type: 'varchar',
          isNullable: true
        }
      ]
    })

    await queryRunner.createTable(racesTable)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('races')
  }
}
