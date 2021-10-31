import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createChallengeChannelsTable1635656451413 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const challengeChannelsTable = new Table({
      name: 'challenge_channels',
      columns: [
        {
          name: 'channel_id',
          type: 'varchar',
          length: '30',
          isPrimary: true
        },
        {
          name: 'challenge_id',
          type: 'int',
          isPrimary: true
        }
      ]
    })

    const challengeForeignKey = new TableForeignKey({
      columnNames: ['challenge_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'challenges_controller'
    })

    await queryRunner.createTable(challengeChannelsTable)
    await queryRunner.createForeignKey(challengeChannelsTable, challengeForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenge_channels')
  }
}
