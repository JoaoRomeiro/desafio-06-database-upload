import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class AddConstraintTransactionsCategories1588292991180
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'fk_transactions_categories',
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'transactions',
      'fk_transactions_categories',
    );
  }
}
