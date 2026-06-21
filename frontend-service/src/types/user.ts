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
