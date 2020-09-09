import { getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

import AppError from '../errors/AppError';

interface Request {
	title: string;
	type: 'income' | 'outcome';
	value: number;
	category: string;
}

class CreateTransactionService {
	public async execute({
		title,
		value,
		type,
		category,
	}: Request): Promise<Transaction> {
		const transactionRepository = getCustomRepository(
			TransactionsRepository,
		);

		const balance = await transactionRepository.getBalance();

		if (type === 'outcome' && balance.total < value) {
			throw new AppError('Current balance is not enough!', 400);
		}

		const categoryRepository = getCustomRepository(CategoriesRepository);

		const transactionCategory = await categoryRepository.findCategoryOrCreate(
			category,
		);

		const category_id = transactionCategory.id;

		const transaction = transactionRepository.create({
			title,
			value,
			type,
			category_id,
		});

		await transactionRepository.save(transaction);

		return transaction;
	}
}

export default CreateTransactionService;
