import { apiFetch } from './api';
import { User, AdminCreateUserRequest, AdminUpdateUserRequest, Address, AddressRequest } from '../types/user';
import { PageResponse } from '../types/common';

export const userService = {
  async getMyProfile(): Promise<User> {
    return apiFetch<User>('/api/users/me', { method: 'GET' });
  },

  async updateMyProfile(request: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> {
    return apiFetch<User>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async getUsers(query?: string, page = 0, size = 10): Promise<PageResponse<User>> {
    return apiFetch<PageResponse<User>>('/api/users', {
      method: 'GET',
      params: { query, page, size },
    });
  },

  async createUser(request: AdminCreateUserRequest): Promise<User> {
    return apiFetch<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateUser(userId: number, request: AdminUpdateUserRequest): Promise<User> {
    return apiFetch<User>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async deactivateUser(userId: number): Promise<void> {
    return apiFetch<void>(`/api/users/${userId}/deactivate`, {
      method: 'PUT',
    });
  },

  async activateUser(userId: number): Promise<void> {
    return apiFetch<void>(`/api/users/${userId}/activate`, {
      method: 'PUT',
    });
  },

  async deleteUser(userId: number): Promise<void> {
    return apiFetch<void>(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getMyAddresses(): Promise<Address[]> {
    return apiFetch<Address[]>('/api/users/me/addresses', {
      method: 'GET',
    });
  },

  async createAddress(request: AddressRequest): Promise<Address> {
    return apiFetch<Address>('/api/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateAddress(addressId: number, request: AddressRequest): Promise<Address> {
    return apiFetch<Address>(`/api/users/me/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async deleteAddress(addressId: number): Promise<void> {
    return apiFetch<void>(`/api/users/me/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  async setDefaultAddress(addressId: number): Promise<Address> {
    return apiFetch<Address>(`/api/users/me/addresses/${addressId}/default`, {
      method: 'PUT',
    });
  }
};
