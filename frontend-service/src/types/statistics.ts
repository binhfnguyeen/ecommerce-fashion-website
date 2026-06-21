export interface RevenueResponse {
  totalRevenue: number;
  completedOrdersCount: number;
}

export interface ChartDataResponse {
  date: string;
  revenue: number;
}
