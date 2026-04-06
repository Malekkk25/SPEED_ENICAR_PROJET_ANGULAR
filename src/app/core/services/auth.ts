import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../enviroments/environment';


// ── Types ───────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  status: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

// ── Service ─────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AuthService {

  // IMPORTANT: /api/auth (sans /v1) pour matcher ton AuthController
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'speed_access_token';
  private readonly REFRESH_KEY = 'speed_refresh_token';
  private readonly USER_KEY = 'speed_user';

  private _currentUser = signal<User | null>(this.loadUser());
  private _isAuthenticated = signal<boolean>(!!localStorage.getItem(this.TOKEN_KEY));

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly userRole = computed(() => this._currentUser()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ─────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/login`, credentials
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.saveTokens(res.data);
          this.saveUser(res.data);
        }
      }),
      catchError(err => {
        const msg = err.error?.message || err.message || 'Erreur de connexion';
        return throwError(() => new Error(msg));
      })
    );
  }

  // ── Refresh ───────────────────────────────────────────
  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/refresh`, { refreshToken }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.saveTokens(res.data);
        }
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  // ── Logout ────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  // ── Accessors ─────────────────────────────────────────
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    return this._currentUser()?.role ?? null;
  }

  getHomeRoute(): string {
    switch (this.getRole()) {
      case 'PSYCHOLOGIST': return '/psychologist/dashboard';
      case 'STUDENT': return '/student/dashboard';
      case 'SCOLARITY': return '/scolarity/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/auth/login';
    }
  }

  // ── Private ───────────────────────────────────────────
  private saveTokens(auth: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, auth.accessToken);
    localStorage.setItem(this.REFRESH_KEY, auth.refreshToken);
    this._isAuthenticated.set(true);
  }

  private saveUser(auth: AuthResponse): void {
    const user: User = {
      id: auth.userId,
      email: auth.email,
      firstName: auth.firstName,
      lastName: auth.lastName,
      fullName: `${auth.firstName} ${auth.lastName}`,
      role: auth.role
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  getCurrentUser(): User | null {
  return this._currentUser();
}
}
