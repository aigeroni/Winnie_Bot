import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createChainsTable1638107137532 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const chainsTable = new Table({
      name: 'chain_wars',
      columns: [
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        {
          name: 'name',
          type: 'varchar',
          length: '150'
        },
        {
          name: 'is_visible',
          type: 'boolean'
        },
        {
          name: 'start_at',
          type: 'varchar'
        },
        {
          name: 'status',
          type: 'enum',
          enum: ['created', 'running', 'canceled', 'completed']
        },
        {
          name: 'guild_id',
          type: 'varchar',
          length: '30'
        },
        {
          name: 'owner_id',
          type: 'varchar',
          length: '30'
        },
        {
          name: 'duration',
          type: 'int',
          default: 10
        },
        {
          name: 'number_of_wars',
          type: 'int'
        },
        {
          name: 'war_margin',
          type: 'int',
          default: 5
        },
        {
          name: 'wars',
          type: 'int',
          isArray: true
        },
        {
          name: 'channels',
          type: 'varchar',
          length: '30',
          isArray: true
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

    await queryRunner.createTable(chainsTable, true)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chains')
  }
}
