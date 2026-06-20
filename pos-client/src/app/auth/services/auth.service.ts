import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, catchError, of, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../../shared/interfaces/auth.interface';
import { Router } from '@angular/router';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) {
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  user = computed(() => this._user());
  token = computed(() => this._token());
  isAdmin = computed(() => this._user()?.role.name === 'ADMIN');

  async login(email: string, password: string): Promise<boolean> {
    return await firstValueFrom(
      this.http
        .post<AuthResponse>(`${baseUrl}/auth/login`, {
          email,
          password,
        })
        .pipe(
          map((resp) => this.handleAuthSuccess(resp)),
          catchError((error) => this.handleAuthError(error)),
        ),
    );
  }

  async checkStatus(): Promise<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return false;
    }

    return await firstValueFrom(
      this.http
        .get<AuthResponse>(`${baseUrl}/auth/renew`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          map((resp) => this.handleAuthSuccess(resp)),
          catchError((error: any) => this.handleAuthError(error)),
        ),
    );
  }

  async logout() {
    localStorage.removeItem('token');
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');
  }

  private handleAuthSuccess({ token, user }: AuthResponse) {
    this._user.set(user);
    this._authStatus.set('authenticated');
    this._token.set(token);

    localStorage.setItem('token', token);

    return true;
  }

  private handleAuthError(error: any) {
    this.logout();
    return of(false);
  }
}
