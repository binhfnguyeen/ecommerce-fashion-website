import { apiFetch, logout } from './api';
import { TokenResponse, UserSession } from '../types/auth';
import { LOCAL_STORAGE_KEYS } from '../constants';

export const authService = {
  async login(username: string, password: string): Promise<UserSession> {
    const data = await apiFetch<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data.role !== 'ADMIN') {
      throw new Error('Chỉ tài khoản Quản trị viên (Admin) mới có quyền đăng nhập hệ thống này!');
    }

    const session: UserSession = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      username: data.username,
      email: data.email,
      role: data.role as 'ADMIN' | 'USER',
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, session.accessToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_INFO, JSON.stringify(session));

    window.dispatchEvent(new Event('auth-login'));
    return session;
  },

  getCurrentSession(): UserSession | null {
    const info = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_INFO);
    if (!info) return null;
    try {
      return JSON.parse(info) as UserSession;
    } catch {
      return null;
    }
  },

  logout() {
    logout();
  }
};
