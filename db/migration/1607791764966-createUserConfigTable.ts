import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createUserConfigTable1607791764966 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userConfigTable = new Table({
      name: 'user_config',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          length: '30',
          isPrimary: true,
          isUnique: true,
          isNullable: false,
        },
        {
          name: 'timezone',
          type: 'varchar',
          length: '45',
        },
      ],
    })

    await queryRunner.createTable(userConfigTable, true)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_config')
  }
}
