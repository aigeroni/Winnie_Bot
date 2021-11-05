import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class addControllerTableForeignKeys1636070931069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('chain_wars', new TableColumn({
      name: 'universal_id',
      type: 'int',
      isNullable: true
    }))
    await queryRunner.addColumn('races', new TableColumn({
      name: 'universal_id',
      type: 'int',
      isNullable: true
    }))
    await queryRunner.addColumn('wars', new TableColumn({
      name: 'universal_id',
      type: 'int',
      isNullable: true
    }))
    const controllerChainWarForeignKey = new TableForeignKey({
      columnNames: ['universal_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'challenges_controller'
    })
    const controllerRaceForeignKey = new TableForeignKey({
      columnNames: ['universal_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'challenges_controller'
    })
    const controllerWarForeignKey = new TableForeignKey({
      columnNames: ['universal_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'challenges_controller'
    })
    await queryRunner.createForeignKey('chain_wars', controllerChainWarForeignKey)
    await queryRunner.createForeignKey('races', controllerRaceForeignKey)
    await queryRunner.createForeignKey('wars', controllerWarForeignKey)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('chain_wars', 'universal_id')
    await queryRunner.dropColumn('races', 'universal_id')
    await queryRunner.dropColumn('wars', 'universal_id')
  }
}
