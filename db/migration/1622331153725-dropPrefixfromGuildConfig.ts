import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class dropPrefixfromGuildConfig1622331153725 implements MigrationInterface {
  name = 'dropPrefixfromGuildConfig1622331153725'

  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('guild_config', 'prefix')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('guild_config', new TableColumn({
      /**
       * The prefix of Winnie's bot commands in this guild.
       */
      name: 'prefix',
      type: 'varchar',
      length: '3',
      isNullable: false
    }))
  }
}
