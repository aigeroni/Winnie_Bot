import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class createChainWarForeignKeys1644104662059 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const chainGuildForeignKey = new TableForeignKey({
      columnNames: ['guild_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'guild_config'
    })
    const chainOwnerForeignKey = new TableForeignKey({
      columnNames: ['owner_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user_config'
    })

    await queryRunner.createForeignKey('chain_wars', chainGuildForeignKey)
    await queryRunner.createForeignKey('chain_wars', chainOwnerForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    const chainsTable = await queryRunner.getTable('goals')
    const chainGuildForeignKey = chainsTable?.foreignKeys.find(fk => fk.columnNames.includes('guild_id'))
    const chainOwnerForeignKey = chainsTable?.foreignKeys.find(fk => fk.columnNames.includes('owner_id'))
    if (chainGuildForeignKey != null) {
      await queryRunner.dropForeignKey('chain_wars', chainGuildForeignKey)
    }
    if (chainOwnerForeignKey != null) {
      await queryRunner.dropForeignKey('chain_wars', chainOwnerForeignKey)
    }
  }
}
