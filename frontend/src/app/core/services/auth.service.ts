import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  map,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';

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

  // 進行中の refresh 通信を保持する。複数APIが同時に401になっても
  // /token/refresh/ を1回だけに集約するための「共有 Observable」。
  private refresh$: Observable<string> | null = null;

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

  /**
   * refresh トークンで access トークンを再発行する。
   *
   * Interceptor が 401 を受けた時に呼ぶ。複数リクエストが同時に
   * 401 になっても通信を1本にまとめるため、進行中の Observable を
   * refresh$ にキャッシュして共有（shareReplay）する。
   */
  refreshAccessToken(): Observable<string> {
    // すでに refresh 中なら、その通信に相乗りする
    if (this.refresh$) {
      return this.refresh$;
    }

    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) {
      return throwError(() => new Error('refresh トークンがありません'));
    }

    this.refresh$ = this.http
      .post<{ access: string }>(`${this.base}/token/refresh/`, { refresh })
      .pipe(
        map((res) => res.access),
        tap((access) => this.storeAccess(access)),
        // refresh も失効していたらログアウト状態に倒す
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        }),
        // 成否に関わらず通信終了でキャッシュを破棄（次回は新たに発行）
        finalize(() => (this.refresh$ = null)),
        // 同時購読した複数リクエストへ同じ結果を配る
        shareReplay(1),
      );

    return this.refresh$;
  }

  private storeTokens(res: TokenResponse): void {
    localStorage.setItem(REFRESH_KEY, res.refresh);
    this.storeAccess(res.access);
  }

  private storeAccess(access: string): void {
    localStorage.setItem(ACCESS_KEY, access);
    this.accessToken.set(access);
  }
}
