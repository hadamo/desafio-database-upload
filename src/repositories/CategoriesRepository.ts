import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
	public async findCategoryOrCreate(title: string): Promise<Category> {
		const category = await this.findOne({ where: { title } });
		if (category) {
			return category;
		}
		const newCategory = this.create({ title });
		await this.save(newCategory);
		return newCategory;
	}
}

export default CategoriesRepository;
