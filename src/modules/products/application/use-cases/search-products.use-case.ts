import { SearchProductsQuery } from '../queries/search-products.query';
import { SearchProductsResult } from '../../domain/repositories/product.repository';

export abstract class SearchProductsUseCase {
  abstract execute(query: SearchProductsQuery): Promise<SearchProductsResult>;
}
