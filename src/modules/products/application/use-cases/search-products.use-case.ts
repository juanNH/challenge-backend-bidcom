import { SearchProductsQuery } from '../queries/search-products.query';
import {
  ProductRepository,
  SearchProductsResult,
} from '../../domain/repositories/product.repository';

export class SearchProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(query: SearchProductsQuery): Promise<SearchProductsResult> {
    return this.productRepository.search(query);
  }
}
