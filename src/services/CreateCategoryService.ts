import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    // Verifica a categoria já existe
    const categoryExists = await categoriesRepository.findOne({
      where: { title },
    });

    // Se não existir, cadastra
    let category = new Category();

    if (!categoryExists) {
      category = await categoriesRepository.save(
        categoriesRepository.create({
          title,
        }),
      );

      await categoriesRepository.save(category);
    } else {
      category = categoryExists;
    }

    return category;
  }
}

export default CreateCategoryService;
