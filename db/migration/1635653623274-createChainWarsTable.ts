import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createChainWarsTable1635653623274 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const chainWarsTable = new Table({
      name: 'chain_wars',
      columns: [
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        {
          name: 'current_war_id',
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
          name: 'number_of_wars',
          type: 'int'
        },
        {
          name: 'war_margin',
          type: 'int'
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

    await queryRunner.createTable(chainWarsTable)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chain_wars')
  }
}
