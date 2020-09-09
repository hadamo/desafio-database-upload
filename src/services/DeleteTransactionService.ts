// import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

class DeleteTransactionService {
	public async execute(id: string): Promise<Transaction> {
		const transactionRepository = getRepository(Transaction);

		const transaction = await transactionRepository.findOne(id);

		if (!transaction) {
			throw new AppError('Transaction not found');
		}

		await transactionRepository.delete(transaction);

		return transaction;
	}
}

export default DeleteTransactionService;
