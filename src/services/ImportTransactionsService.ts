import csvParse, { CsvError } from 'csv-parse';
import fs from 'fs';
import { getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVRow {
	title: string;
	type: 'income' | 'outcome';
	value: number;
	category: string;
}

class ImportTransactionsService {
	async execute(csvFilePath: string): Promise<Transaction[]> {
		const readCSVStream = fs.createReadStream(csvFilePath);

		const parseStream = csvParse({
			from_line: 2,
			ltrim: true,
			rtrim: true,
		});

		const parseCSV = readCSVStream.pipe(parseStream);

		const parsedRows: CSVRow[] = [];

		// set para manter apenas valores únicos
		const uniqueCategories = new Set<string>();

		parseCSV.on('data', async row => {
			const parsedRow: CSVRow = {
				title: row[0],
				type: row[1],
				value: Number(row[2]),
				category: row[3],
			};

			uniqueCategories.add(row[3]);
			parsedRows.push(parsedRow);
		});

		await new Promise(resolve => {
			parseCSV.on('end', resolve);
		});

		const transactionsRepository = getCustomRepository(
			TransactionsRepository,
		);
		const categoriesRepository = getCustomRepository(CategoriesRepository);

		const categories = new Map();
		uniqueCategories.forEach(async title => {
			const newCategory = await categoriesRepository.findCategoryOrCreate(
				title,
			);
			categories.set(title, newCategory);
		});

		const transactions = transactionsRepository.create(
			parsedRows.map(({ title, type, value, category }: CSVRow) => ({
				title,
				type,
				value,
				category_id: categories.get(category),
			})),
		);

		transactionsRepository.insert(transactions);

		return transactions;
	}
}

export default ImportTransactionsService;
