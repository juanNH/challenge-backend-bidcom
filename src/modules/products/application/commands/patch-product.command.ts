export type PatchProductCommand = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  brandId?: string;
};
