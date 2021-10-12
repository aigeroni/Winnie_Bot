import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createRaptorsTable1633795266003 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const raptorsTable = new Table({
      name: 'raptors',
      columns: [
        {
          name: 'guild_id',
          type: 'varchar',
          length: '30',
          isPrimary: true,
          isNullable: false
        },
        {
          name: 'user_id',
          type: 'varchar',
          length: '30',
          isPrimary: true,
          isNullable: false
        },
        {
          name: 'white_raptors',
          type: 'int',
          default: 0
        },
        {
          name: 'green_raptors',
          type: 'int',
          default: 0
        },
        {
          name: 'blue_raptors',
          type: 'int',
          default: 0
        },
        {
          name: 'purple_raptors',
          type: 'int',
          default: 0
        },
        {
          name: 'orange_raptors',
          type: 'int',
          default: 0
        }
      ]
    })

    await queryRunner.createTable(raptorsTable, true)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('raptors')
  }
}
