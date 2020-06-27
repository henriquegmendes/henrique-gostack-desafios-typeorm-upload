import { getRepository } from 'typeorm';
import { isUuid } from 'uuidv4';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface RequestService {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestService): Promise<void> {
    if (!isUuid(id)) {
      throw new AppError('Invalid id', 400);
    }

    const transactionRepository = getRepository(Transaction);

    const existingTransaction = await transactionRepository.findOne(id);

    if (!existingTransaction) {
      throw new AppError('Transaction with specified id not found', 400);
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
