export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  email: string;
  role: string;
}

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
}
