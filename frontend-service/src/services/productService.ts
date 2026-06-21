import { apiFetch } from './api';
import { Product, ProductRequest } from '../types/product';
import { PageResponse } from '../types/common';

export const productService = {
  async getProductsForAdmin(search?: string, categoryId?: number, page = 0, size = 10): Promise<PageResponse<Product>> {
    return apiFetch<PageResponse<Product>>('/api/products/admin', {
      method: 'GET',
      params: { search, categoryId, page, size },
    });
  },

  async getProducts(search?: string, categoryId?: number, page = 0, size = 10): Promise<PageResponse<Product>> {
    return apiFetch<PageResponse<Product>>('/api/products', {
      method: 'GET',
      params: { search, categoryId, page, size },
    });
  },

  async getProduct(id: number): Promise<Product> {
    return apiFetch<Product>(`/api/products/${id}`, {
      method: 'GET',
    });
  },

  async createProduct(request: ProductRequest): Promise<Product> {
    return apiFetch<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateProduct(id: number, request: ProductRequest): Promise<Product> {
    return apiFetch<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async deleteProduct(id: number): Promise<void> {
    return apiFetch<void>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }
};
