import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

// ログインAPI（/auth/token/）のレスポンス形。
interface TokenResponse {
  access: string;
  refresh: string;
}

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' }) // アプリ全体で1インスタンス共有（DIのシングルトン）
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;

  // signal: 値が変わるとUIが自動更新される（ReactのuseStateに近いがDI管理）。
  // 初期値はlocalStorageの保存トークンから復元（リロードしてもログイン維持）。
  private readonly accessToken = signal<string | null>(
    localStorage.getItem(ACCESS_KEY),
  );

  // computed: accessToken から派生する読み取り専用signal。
  readonly isAuthenticated = computed(() => this.accessToken() !== null);

  constructor(private http: HttpClient) {}

  /** 同期的にトークンを取り出す（Interceptorから使う）。 */
  getAccessToken(): string | null {
    return this.accessToken();
  }

  /** 新規登録。成功後はそのままログインさせる想定。 */
  register(username: string, password: string): Observable<unknown> {
    return this.http.post(`${this.base}/register/`, { username, password });
  }

  /** ログイン。成功したらトークンを保存し signal を更新。 */
  login(username: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.base}/token/`, { username, password })
      .pipe(tap((res) => this.storeTokens(res)));
  }

  /** ログアウト。保存トークンを破棄。 */
  logout(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.accessToken.set(null);
  }

  private storeTokens(res: TokenResponse): void {
    localStorage.setItem(ACCESS_KEY, res.access);
    localStorage.setItem(REFRESH_KEY, res.refresh);
    this.accessToken.set(res.access);
  }
}
