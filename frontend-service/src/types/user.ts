export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
  active: boolean;
}

export interface AdminCreateUserRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
}

export interface AdminUpdateUserRequest {
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
}

export interface Address {
  id: number;
  userId: number;
  addressName: string;
  addressLine: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressRequest {
  addressName: string;
  addressLine: string;
  phone: string;
  isDefault?: boolean;
}
