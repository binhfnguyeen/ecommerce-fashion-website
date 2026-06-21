export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
  imageUrl: string;
  categoryId: number;
}
