import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Transactions {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transaction = getRepository(Transaction);
    const transactions = await transaction.find();

    let income = 0;
    let outcome = 0;

    transactions.map(item => {
      if (item.type === 'income') {
        income += Number(item.value);
      } else {
        outcome += Number(item.value);
      }
    });

    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }

  public async all(): Promise<Transactions> {
    const transaction = getRepository(Transaction);
    const transactions = await transaction.find();
    const balance = await this.getBalance();

    const transactionsResponse: Transactions = {
      transactions,
      balance,
    };

    return transactionsResponse;
  }
}

export default TransactionsRepository;
