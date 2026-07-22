import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../../shared/interfaces/auth.interface';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));
  private _authError = signal<string | null>(null);

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
  authError = computed(() => this._authError());

  async login(email: string, password: string): Promise<boolean> {
    this._authError.set(null);

    try {
      const resp = await firstValueFrom(
        this.http.post<AuthResponse>(`${baseUrl}/auth/login`, { email, password }),
      );
      this.handleAuthSuccess(resp);
      return true;
    } catch (error) {
      this.handleAuthError('Correo o contraseña incorrectos');
      return false;
    }
  }

  async checkStatus(): Promise<boolean> {
    if (!this._token()) {
      this.logout();
      return false;
    }

    try {
      const resp = await firstValueFrom(this.http.get<AuthResponse>(`${baseUrl}/auth/renew`));
      this.handleAuthSuccess(resp);
      return true;
    } catch (error) {
      this.handleAuthError('Tu sesión expiró, inicia sesión de nuevo');
      return false;
    }
  }

  logout(): void {
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
  }

  private handleAuthError(message: string) {
    this._authError.set(message);
    this.logout();
  }
}
