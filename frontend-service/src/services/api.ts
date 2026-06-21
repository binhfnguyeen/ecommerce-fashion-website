import { API_BASE_URL, LOCAL_STORAGE_KEYS } from '../constants';
import { TokenResponse } from '../types/auth';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  const finalHeaders = new Headers(headers);
  const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  if (accessToken && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  if (restOptions.body && !(restOptions.body instanceof FormData) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  let response = await fetch(url, {
    ...restOptions,
    headers: finalHeaders,
  });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data: TokenResponse = await refreshResponse.json();
          localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
          localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

          finalHeaders.set('Authorization', `Bearer ${data.accessToken}`);
          response = await fetch(url, {
            ...restOptions,
            headers: finalHeaders,
          });
        } else {
          logout();
          throw new Error('Session expired');
        }
      } catch (err) {
        logout();
        throw err;
      }
    } else {
      logout();
      throw new Error('Unauthorized');
    }
  }

  if (!response.ok) {
    let errorMessage = `Lỗi hệ thống (${response.status})`;
    try {
      const errData = await response.json();
      if (errData && errData.message) {
        errorMessage = errData.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');
  if (!contentType?.includes('application/json') || contentLength === '0') {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export function logout() {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);
  window.dispatchEvent(new Event('auth-logout'));
}
