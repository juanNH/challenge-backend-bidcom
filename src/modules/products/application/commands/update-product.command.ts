export type UpdateProductCommand = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId: string;
  brandId: string;
};
