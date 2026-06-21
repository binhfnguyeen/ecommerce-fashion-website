import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { RevenueChart } from '../components/RevenueChart';
import { orderService } from '../services/orderService';
import { RevenueResponse, ChartDataResponse } from '../types/statistics';
import { formatCurrency } from '../utils/formatters';
import MonetizationOn from '@mui/icons-material/MonetizationOn';
import ReceiptLong from '@mui/icons-material/ReceiptLong';

export const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<RevenueResponse>({ totalRevenue: 0, completedOrdersCount: 0 });
  const [chartData, setChartData] = useState<ChartDataResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Parallel fetches
      const [statsRes, chartRes] = await Promise.all([
        orderService.getRevenueStatistics(),
        orderService.getDailyRevenueChartData(),
      ]);

      setStats(statsRes || { totalRevenue: 0, completedOrdersCount: 0 });
      setChartData(chartRes || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not connect to the server to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      <PageHeader
        title="System Overview"
        description="Track sales, store growth, and interactive analytical charts."
      />

      {error && (
        <div className="login-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '40px 0', textAlign: 'center' }}>
          Loading statistics...
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="card-grid">
            <div className="stat-card">
              <div className="stat-card-icon success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MonetizationOn />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-label">Total Revenue</span>
                <span className="stat-card-value">{formatCurrency(stats.totalRevenue)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ReceiptLong style={{ fontSize: '24px' }} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-label">Completed Orders</span>
                <span className="stat-card-value">{stats.completedOrdersCount} orders</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <RevenueChart data={chartData} />
        </>
      )}
    </div>
  );
};
