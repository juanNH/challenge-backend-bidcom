import { SearchProductsQuery } from '../queries/search-products.query';
import {
  ProductRepository,
  SearchProductsResult,
} from '../../domain/repositories/product.repository';

export class SearchProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(query: SearchProductsQuery): Promise<SearchProductsResult> {
    void this.productRepository;
    void query;
    return Promise.reject(new Error('Not implemented'));
  }
}
