import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

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

    parseCSV.on('data', line => {
      createTransactions.push({
        title: line[0],
        value: Number(line[2]),
        type: line[1],
        category: line[3],
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransactionService = new CreateTransactionService();
    const transactions = Array<Transaction>();

    const promise = createTransactions.map(async item => {
      transactions.push(
        await createTransactionService.execute({
          title: item.title,
          category: item.category,
          type: item.type,
          value: item.value,
        }),
      );
    });

    await Promise.all(promise);

    return transactions;
  }
}

export default ImportTransactionsService;
