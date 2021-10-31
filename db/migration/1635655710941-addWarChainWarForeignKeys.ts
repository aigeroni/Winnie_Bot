import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm'

export class addWarChainWarForeignKeys1635655710941 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const chainWarCurrentWarForeignKey = new TableForeignKey({
      columnNames: ['current_war_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'wars'
    })

    const warChainWarForeignKey = new TableForeignKey({
      columnNames: ['chain_war_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'chain_wars'
    })

    await queryRunner.createForeignKey('chain_wars', chainWarCurrentWarForeignKey)
    await queryRunner.createForeignKey('wars', warChainWarForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    const warsTable = await queryRunner.getTable('wars')
    const warsTableForeignKey = warsTable?.foreignKeys.find(fk => fk.columnNames.includes('chain_war_id'))
    if (warsTableForeignKey != null) {
      await queryRunner.dropForeignKey('wars', warsTableForeignKey)
    }

    const chainWarsTable = await queryRunner.getTable('chain_wars')
    const chainWarsTableForeignKey = chainWarsTable?.foreignKeys.find(fk => fk.columnNames.includes('current_war_id'))
    if (chainWarsTableForeignKey != null) {
      await queryRunner.dropForeignKey('chain_wars', chainWarsTableForeignKey)
    }
  }
}
