import { getRepository, getCustomRepository } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface RequestService {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestService): Promise<Transaction> {
    if (!title || !value || !type || !category) {
      throw new AppError(
        'Necessário preencher todos os parâmetros obrigatórios',
        400,
      );
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Parâmetro "type" inválido', 400);
    }

    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (balance.total - value < 0) {
        throw new AppError(
          'Saldo insuficiente para adicionar esta despesa',
          400,
        );
      }
    }

    const existentCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    let categoryId;

    if (!existentCategory) {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      categoryId = newCategory.id;
    } else {
      categoryId = existentCategory.id;
    }

    const newTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });

    await transactionsRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
