import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createChallengeUsersTable1635656445669 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const challengeUsersTable = new Table({
      name: 'challenge_users',
      columns: [
        {
          name: 'user_id',
          type: 'varchar',
          length: '30',
          isPrimary: true
        },
        {
          name: 'challenge_id',
          type: 'int',
          isPrimary: true
        },
        {
          name: 'channel_id',
          type: 'varchar',
          length: '30',
          isNullable: false
        },
        {
          name: 'total',
          type: 'int'
        },
        {
          name: 'total_type',
          type: 'enum',
          enum: ['items', 'lines', 'minutes', 'pages', 'words']
        }
      ]
    })

    const challengeForeignKey = new TableForeignKey({
      columnNames: ['challenge_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'challenges_controller'
    })

    await queryRunner.createTable(challengeUsersTable)
    await queryRunner.createForeignKey(challengeUsersTable, challengeForeignKey)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenge_users')
  }
}
