import { Injectable } from '@angular/core';
import {
  LoginCommandDto,
  RefreshTokenCommandDto
} from '../../../api-services/auth/auth-api.model';

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly ACCESS_EXPIRES_KEY = 'accessTokenExpiresAtUtc';
  private readonly REFRESH_EXPIRES_KEY = 'refreshTokenExpiresAtUtc';

  saveLogin(response: LoginCommandDto): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.ACCESS_EXPIRES_KEY, response.expiresAtUtc);
  }

  saveRefresh(response: RefreshTokenCommandDto): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.ACCESS_EXPIRES_KEY, response.accessTokenExpiresAtUtc);
    localStorage.setItem(this.REFRESH_EXPIRES_KEY, response.refreshTokenExpiresAtUtc);
  }

  clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ACCESS_EXPIRES_KEY);
    localStorage.removeItem(this.REFRESH_EXPIRES_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  hasToken(): boolean {
    return !!this.getAccessToken();
  }
}
