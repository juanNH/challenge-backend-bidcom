export type SearchProductsQuery = {
  name?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  limit: number;
  offset: number;
};
