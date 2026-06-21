import { apiFetch } from './api';
import { Order, OrderStatus } from '../types/order';
import { RevenueResponse, ChartDataResponse } from '../types/statistics';
import { PageResponse } from '../types/common';

export const orderService = {
  async getAllOrders(status?: string, page = 0, size = 10): Promise<PageResponse<Order>> {
    const params: Record<string, string | number | boolean | undefined> = { page, size };
    if (status && status !== 'ALL') {
      params.status = status;
    }
    return apiFetch<PageResponse<Order>>('/api/orders', {
      method: 'GET',
      params,
    });
  },

  async getOrderById(id: number): Promise<Order> {
    return apiFetch<Order>(`/api/orders/${id}`, {
      method: 'GET',
    });
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    return apiFetch<Order>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async cancelOrder(id: number): Promise<void> {
    return apiFetch<void>(`/api/orders/${id}/cancel`, {
      method: 'PUT',
    });
  },

  async getRevenueStatistics(): Promise<RevenueResponse> {
    return apiFetch<RevenueResponse>('/api/orders/statistics/revenue', {
      method: 'GET',
    });
  },

  async getDailyRevenueChartData(): Promise<ChartDataResponse[]> {
    return apiFetch<ChartDataResponse[]>('/api/orders/statistics/chart', {
      method: 'GET',
    });
  }
};
