import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { orderService } from '../services/orderService';
import { Order, OrderStatus } from '../types/order';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ORDER_STATUSES } from '../constants';
import Search from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search and Pagination
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(8);

  // Detail Drawer state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [drawerError, setDrawerError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderService.getAllOrders(statusFilter, page, pageSize);
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.message || 'Failed to load order list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setDrawerError('');
  };

  const handleCloseDrawer = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedOrder) return;
    const newStatus = e.target.value as OrderStatus;
    
    setUpdatingStatus(true);
    setDrawerError('');
    try {
      const updated = await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      setSelectedOrder(updated);
      fetchOrders(); // Refresh grid
    } catch (err: any) {
      setDrawerError(err.message || 'Error updating order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (window.confirm(`Are you sure you want to cancel order #${selectedOrder.id}?`)) {
      setUpdatingStatus(true);
      setDrawerError('');
      try {
        await orderService.cancelOrder(selectedOrder.id);
        // Refresh details
        const updated = await orderService.getOrderById(selectedOrder.id);
        setSelectedOrder(updated);
        fetchOrders();
      } catch (err: any) {
        setDrawerError(err.message || 'Error cancelling order.');
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'PAID': return 'badge-info';
      case 'SHIPPED': return 'badge-primary'; // in css, badge-info or other custom class
      case 'COMPLETED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getStatusName = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'Pending Payment';
      case 'PAID': return 'Paid';
      case 'SHIPPED': return 'Shipping';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div>
      <PageHeader
        title="Order Management"
        description="View list of shopping orders, check payment details, and update shipping progress."
      />

      {/* Actions and Filters block */}
      <div className="actions-bar">
        <div className="filters-wrapper">
          <label className="form-label" style={{ margin: 0 }}>Filter by status:</label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="ALL">All statuses</option>
            {ORDER_STATUSES.map(st => (
              <option key={st} value={st}>
                {getStatusName(st)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="login-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {/* Table grid */}
      <div className="table-container">
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
            Loading order data...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
            No orders found.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Order ID</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => handleRowClick(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>#{order.id}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(order.createdAt)}</td>
                  <td style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusName(order.status)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="action-icon-btn flex items-center justify-center" title="View details">
                      <Search style={{ fontSize: '18px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Slide-out Drawer Panel on Right */}
      {selectedOrder && (
        <>
          <div className="detail-drawer-overlay" onClick={handleCloseDrawer} />
          <div className="detail-drawer">
            <div className="drawer-header">
              <h3 className="modal-title">Order Details #{selectedOrder.id}</h3>
              <button className="modal-close flex items-center justify-center" onClick={handleCloseDrawer}>
                <Close style={{ fontSize: '20px' }} />
              </button>
            </div>

            <div className="drawer-body">
              {drawerError && <div className="login-error">{drawerError}</div>}

              {/* Status Update Section */}
              <div className="drawer-section" style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <span className="drawer-section-title">Order Status</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                  <select
                    className="filter-select"
                    style={{ flex: 1 }}
                    value={selectedOrder.status}
                    onChange={handleStatusChange}
                    disabled={updatingStatus || selectedOrder.status === 'CANCELLED'}
                  >
                    {ORDER_STATUSES.map(st => (
                      <option key={st} value={st} disabled={st === 'CANCELLED' && selectedOrder.status !== 'PENDING' && selectedOrder.status !== 'PAID'}>
                        {getStatusName(st)}
                      </option>
                    ))}
                  </select>

                  {/* Cancel button if possible */}
                  {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'PAID') && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={handleCancelOrder}
                      disabled={updatingStatus}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div className="drawer-section">
                <span className="drawer-section-title font-display">Shipping Details</span>
                <div className="drawer-data-row">
                  <span className="drawer-data-label">Customer:</span>
                  <span className="drawer-data-value">{selectedOrder.customerName}</span>
                </div>
                <div className="drawer-data-row">
                  <span className="drawer-data-label">Contact Email:</span>
                  <span className="drawer-data-value">{selectedOrder.customerEmail}</span>
                </div>
                <div className="drawer-data-row">
                  <span className="drawer-data-label">Shipping Address:</span>
                  <span className="drawer-data-value">{selectedOrder.shippingAddress || 'Pickup at store'}</span>
                </div>
                <div className="drawer-data-row">
                  <span className="drawer-data-label">PayPal Transaction ID:</span>
                  <span className="drawer-data-value" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {selectedOrder.paypalOrderId || 'COD Payment / Unpaid'}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="drawer-section">
                <span className="drawer-section-title">Order Items</span>
                <div className="drawer-items-list">
                  {selectedOrder.items && selectedOrder.items.map(item => (
                    <div key={item.id} className="drawer-item-row">
                      <div>
                        <div className="drawer-item-name">{item.productName}</div>
                        <div className="drawer-item-qty">
                          Price: {formatCurrency(item.price)} &times; {item.quantity} units
                        </div>
                      </div>
                      <div className="drawer-item-price">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="drawer-section" style={{ borderTop: '2px solid var(--border-color)', paddingTop: '16px' }}>
                <div className="drawer-data-row" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  <span>TOTAL AMOUNT:</span>
                  <span style={{ color: 'var(--accent-primary)' }}>
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
