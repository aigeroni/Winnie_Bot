import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class updateUserConfigTable1638258714475 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('user_config', [
      new TableColumn({
        name: 'home_guild',
        type: 'varchar',
        length: '30',
        isNullable: true
      }),
      new TableColumn({
        name: 'minutes_to_raptor',
        type: 'int',
        default: 0
      })
    ])
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('user_config', ['home_guild', 'minutes_to_raptor'])
  }
}
