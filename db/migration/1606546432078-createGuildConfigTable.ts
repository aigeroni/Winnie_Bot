import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createGuildConfigTable1606546432078 implements MigrationInterface {
  name = 'createGuildConfigTable1606546432078'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const guildConfigTable = new Table({
      name: 'guild_config',
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
          name: 'prefix',
          type: 'varchar',
          length: '3',
          isNullable: false,
        },
        {
          name: 'announcements_channel_id',
          type: 'varchar',
          length: '30',
          isNullable: true,
        },
        {
          name: 'cross_guild',
          type: 'boolean',
          isNullable: false,
          default: true,
        },
        {
          name: 'locale',
          type: 'varchar',
          length: '2',
          isNullable: false,
        },
        {
          name: 'timezone',
          type: 'varchar',
          length: '45',
          isNullable: true,
        },
      ],
    })

    await queryRunner.createTable(guildConfigTable, true)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('guild_config')
  }

}
