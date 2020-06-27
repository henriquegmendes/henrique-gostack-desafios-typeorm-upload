import fs from 'fs';
import path from 'path';
import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import loadCSV from '../utils/parseCsv';
import upload from '../config/upload';
import AppError from '../errors/AppError';

interface RequestService {
  file: Express.Multer.File;
}

class ImportTransactionsService {
  public async execute({ file }: RequestService): Promise<Transaction[]> {
    const csvData = await loadCSV(file.originalname);

    csvData.forEach(data => {
      const { title, type, value, category } = data;

      if (
        !title ||
        !type ||
        !value ||
        !category ||
        (type !== 'income' && type !== 'outcome')
      ) {
        throw new AppError(
          'An error occurred while trying to load your data. Please review your .csv file and try again',
        );
      }
    });

    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);
    const transactionsData = [];

    for (let i = 0; i < csvData.length; i += 1) {
      const { title, type, value, category } = csvData[i];

      const transactionData = {
        title,
        type,
        value,
        category_id: '',
      };

      const existentCategory = await categoriesRepository.findOne({
        where: { title: category },
      });

      if (!existentCategory) {
        const newCategory = categoriesRepository.create({
          title: category,
        });

        await categoriesRepository.save(newCategory);

        transactionData.category_id = newCategory.id;
      } else {
        transactionData.category_id = existentCategory.id;
      }

      transactionsData.push(transactionData);
    }

    const newTransactions = transactionsData.map(data =>
      transactionsRepository.create(data),
    );

    await transactionsRepository.save(newTransactions);

    await fs.promises.unlink(path.resolve(upload.directory, file.originalname));

    return newTransactions;
  }
}

export default ImportTransactionsService;
