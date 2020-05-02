import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: 'uuid'): Promise<void> {
    if (!id) {
      throw new AppError('ID is required');
    }

    const transactionRepository = getRepository(Transaction);
    const transaction = await transactionRepository.findOne({
      where: {
        id,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction do not exists');
    }

    transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
