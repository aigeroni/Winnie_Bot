import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createWarsTable1635653667036 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const warsTable = new Table({
      name: 'wars',
      columns: [
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        {
          name: 'chain_war_id',
          type: 'int'
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
          name: 'duration',
          type: 'int'
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

    await queryRunner.createTable(warsTable)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wars')
  }
}
