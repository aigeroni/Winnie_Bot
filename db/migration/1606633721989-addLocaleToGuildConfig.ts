import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class addLocaleToGuildConfig1606633721989 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('guild_config', new TableColumn({
      name: 'locale',
      type: 'varchar',
      length: '2',
      isNullable: false,
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('guild_config', 'locale')
  }
}
