export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  totalAmount: number;
  status: OrderStatus;
  paypalOrderId: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
