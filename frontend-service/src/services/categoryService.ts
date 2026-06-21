import { apiFetch } from './api';
import { Category, CategoryRequest } from '../types/category';
import { PageResponse } from '../types/common';

export const categoryService = {
  async getCategories(search?: string, page = 0, size = 10): Promise<PageResponse<Category>> {
    return apiFetch<PageResponse<Category>>('/api/categories', {
      method: 'GET',
      params: { search, page, size },
    });
  },

  async getCategory(id: number): Promise<Category> {
    return apiFetch<Category>(`/api/categories/${id}`, {
      method: 'GET',
    });
  },

  async createCategory(request: CategoryRequest): Promise<Category> {
    return apiFetch<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateCategory(id: number, request: CategoryRequest): Promise<Category> {
    return apiFetch<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async deleteCategory(id: number): Promise<void> {
    return apiFetch<void>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }
};
