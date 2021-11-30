import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class createChallengeTotalsTable1638107169726 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const challengeTotalsTable = new Table({
      name: 'challenge_totals',
      columns: [
        {
          name: 'challenge_id',
          type: 'int',
          isPrimary: true,
          isNullable: false
        },
        {
          name: 'user_id',
          type: 'varchar',
          length: '30',
          isPrimary: true,
          isNullable: false
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
          name: 'chain_id',
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
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenge_totals')
  }
}
