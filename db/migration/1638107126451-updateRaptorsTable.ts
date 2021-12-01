import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class updateRaptorsTable1638107126451 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('raptors', new TableColumn({
      name: 'period_id',
      type: 'varchar',
      length: '7',
      default: '2021-11'
    }))

    // const raptorGuildForeignKey = new TableForeignKey({
    //   columnNames: ['guild_id'],
    //   referencedColumnNames: ['id'],
    //   referencedTableName: 'guild_config'
    // })
    // const raptorUserForeignKey = new TableForeignKey({
    //   columnNames: ['user_id'],
    //   referencedColumnNames: ['id'],
    //   referencedTableName: 'user_config'
    // })

    // await queryRunner.createForeignKey('raptors', raptorGuildForeignKey)
    // await queryRunner.createForeignKey('raptors', raptorUserForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    // const raptorsTable = await queryRunner.getTable('goals')
    // const raptorGuildForeignKey = raptorsTable?.foreignKeys.find(fk => fk.columnNames.includes('guild_id'))
    // if (raptorGuildForeignKey != null) {
    //   await queryRunner.dropForeignKey('raptors', raptorGuildForeignKey)
    // }
    // const raptorOwnerForeignKey = raptorsTable?.foreignKeys.find(fk => fk.columnNames.includes('owner_id'))
    // if (raptorOwnerForeignKey != null) {
    //   await queryRunner.dropForeignKey('raptors', raptorOwnerForeignKey)
    // }

    await queryRunner.dropColumn('raptors', 'period_id')
  }
}
