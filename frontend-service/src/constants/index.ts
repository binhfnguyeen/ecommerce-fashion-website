export const API_BASE_URL = 'http://localhost:8000';

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  REFRESH_TOKEN: 'admin_refresh_token',
  USER_INFO: 'admin_user_info',
};

export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED'
] as const;

export const USER_ROLES = [
  'USER',
  'ADMIN'
] as const;
