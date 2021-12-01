import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createChallengeTotalsTable1638107169726 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const challengeTotalsTable = new Table({
      name: 'challenge_totals',
      columns: [
        {
          name: 'challenge_id',
          type: 'int',
          isPrimary: true
        },
        {
          name: 'user_id',
          type: 'varchar',
          length: '30',
          isPrimary: true
        },
        {
          name: 'guild_id',
          type: 'varchar',
          length: '30'
        },
        {
          name: 'total',
          type: 'int',
          default: 0
        },
        {
          name: 'total_type',
          type: 'enum',
          enum: ['items', 'lines', 'minutes', 'pages', 'words']
        },
        {
          name: 'chain_war_id',
          type: 'int',
          isNullable: true
        },
        {
          name: 'channel_id',
          type: 'varchar',
          length: '30'
        },
        {
          name: 'project_id',
          type: 'int',
          isNullable: true
        }
      ]
    })

    await queryRunner.createTable(challengeTotalsTable, true)

    const ctGuildForeignKey = new TableForeignKey({
      columnNames: ['guild_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'guild_config'
    })
    const ctUserForeignKey = new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'user_config'
    })
    const ctChallengeForeignKey = new TableForeignKey({
      columnNames: ['challenge_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'challenges'
    })
    const ctChainForeignKey = new TableForeignKey({
      columnNames: ['chain_war_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'chain_wars'
    })
    const ctProjectForeignKey = new TableForeignKey({
      columnNames: ['project_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'projects'
    })

    await queryRunner.createForeignKey('challenge_totals', ctGuildForeignKey)
    await queryRunner.createForeignKey('challenge_totals', ctUserForeignKey)
    await queryRunner.createForeignKey('challenge_totals', ctChallengeForeignKey)
    await queryRunner.createForeignKey('challenge_totals', ctChainForeignKey)
    await queryRunner.createForeignKey('challenge_totals', ctProjectForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenge_totals')
  }
}
