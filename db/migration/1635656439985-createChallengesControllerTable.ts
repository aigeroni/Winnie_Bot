import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createChallengesControllerTable1635656439985 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const challengesControllerTable = new Table({
      name: 'challenges_controller',
      columns: [
        {
          name: 'id',
          type: 'serial',
          isPrimary: true
        },
        {
          name: 'war_id',
          type: 'int',
          isNullable: true
        },
        {
          name: 'race_id',
          type: 'int',
          isNullable: true
        },
        {
          name: 'chain_war_id',
          type: 'int',
          isNullable: true
        }
      ]
    })

    const warsForeignKey = new TableForeignKey({
      columnNames: ['war_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'wars'
    })

    const racesForeignKey = new TableForeignKey({
      columnNames: ['race_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'races'
    })

    const chainWarsForeignKey = new TableForeignKey({
      columnNames: ['chain_war_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'chain_wars'
    })

    await queryRunner.createTable(challengesControllerTable)
    await queryRunner.createForeignKeys(challengesControllerTable, [
      warsForeignKey,
      racesForeignKey,
      chainWarsForeignKey
    ])
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenges_controller')
  }
}
