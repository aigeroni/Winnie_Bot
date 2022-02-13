import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm'

export class updateRaptorsTable1638107126451 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('raptors', new TableColumn({
      /**
       * The period in which the raptors were earned.
       *
       * Part of the table's primary key, along with guildId.
       */
      name: 'period_id',
      type: 'varchar',
      length: '7',
      default: '2021-11'
    }))

    const raptorGuildForeignKey = new TableForeignKey({
      columnNames: ['guild_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'guild_config'
    })
    const raptorUserForeignKey = new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user_config'
    })
    // const raptorPeriodForeignKey = new TableForeignKey({
    //   columnNames: ['period_id'],
    //   referencedColumnNames: ['id'],
    //   referencedTableName: 'period_config'
    // })

    await queryRunner.createForeignKey('raptors', raptorGuildForeignKey)
    await queryRunner.createForeignKey('raptors', raptorUserForeignKey)
    // await queryRunner.createForeignKey('raptors', raptorPeriodForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    const raptorsTable = await queryRunner.getTable('goals')
    const raptorGuildForeignKey = raptorsTable?.foreignKeys.find(fk => fk.columnNames.includes('guild_id'))
    if (raptorGuildForeignKey != null) {
      await queryRunner.dropForeignKey('raptors', raptorGuildForeignKey)
    }
    const raptorUserForeignKey = raptorsTable?.foreignKeys.find(fk => fk.columnNames.includes('owner_id'))
    if (raptorUserForeignKey != null) {
      await queryRunner.dropForeignKey('raptors', raptorUserForeignKey)
    }

    await queryRunner.dropColumn('raptors', 'period_id')
  }
}
