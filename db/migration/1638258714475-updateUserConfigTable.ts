import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class updateUserConfigTable1638258714475 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('user_config', [
      /**
       * The guild to which the user wants their raptors to hatch.
       */
      new TableColumn({
        name: 'home_guild',
        type: 'varchar',
        length: '30',
        isNullable: true
      }),
      /**
       * The number of minutes remaining until the user is guaranteed a challenge raptor.
       */
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
