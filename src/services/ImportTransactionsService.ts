import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import CreateCategoryService from './CreateCategoryService';
import Category from '../models/Category';

interface CreateTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  public async execute(file: string): Promise<Transaction[]> {
    const csvFilePath = file;
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    const createTransactions = Array<CreateTransaction>();
    const categoriesAll = Array<string>();

    parseCSV.on('data', line => {
      createTransactions.push({
        title: line[0],
        value: Number(line[2]),
        type: line[1],
        category: line[3],
      });

      categoriesAll.push(line[3]);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // retira a repetição das categorias
    const categoriesUnique = Array.from(new Set(categoriesAll));

    // Cadastra as categorias que ainda nao existem no banco
    const categoriesRepository = getRepository(Category);
    const categories = Array<Category>();
    const promise1 = categoriesUnique.map(async item => {
      const existe = await categoriesRepository.findOne({
        where: { title: item.trim() },
      });

      if (!existe) {
        const category = await categoriesRepository.create({
          title: item.trim(),
        });

        await categoriesRepository.save(category);

        categories.push(category);
      } else {
        categories.push(existe);
      }
    });

    await Promise.all(promise1);

    // Adicona as transações
    const transactionsRepository = getRepository(Transaction);
    const transactions = await transactionsRepository.create(
      createTransactions.map(item => ({
        title: item.title,
        type: item.type,
        value: item.value,
        category: categories.find(
          category => category.title === item.category.trim(),
        ),
      })),
    );

    await transactionsRepository.save(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;
