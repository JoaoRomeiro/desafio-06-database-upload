import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // Checa os paramentros de entrada
    this.checkParams({ title, value, type, category });

    // Verifca se tem saldo para fazer a saida
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance: Balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Insufficient funds');
    }

    const categoryService = new CreateCategoryService();
    const createdCategory = await categoryService.execute({ title: category });

    // Insere uma transação
    const transactions = await transactionsRepository.create({
      category_id: createdCategory.id,
      title,
      value,
      type,
    });

    const transaction = await transactionsRepository.save(transactions);

    await Promise.all([balance, createdCategory, transactions, transaction]);

    return transactions;
  }

  private checkParams({ title, value, type, category }: Request): void {
    if (!title) {
      throw new AppError('The field title is required.');
    }

    if (!value) {
      throw new AppError('The field value is required.');
    }

    if (!type) {
      throw new AppError('The field type is required.');
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type is invalid (required income or outcome).');
    }

    if (!category) {
      throw new AppError('The category type is required.');
    }
  }
}

export default CreateTransactionService;
