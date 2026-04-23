export type CreateProductCommand = {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId: string;
  brandId: string;
};
