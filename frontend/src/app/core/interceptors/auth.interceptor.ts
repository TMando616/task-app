import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/** リクエストを複製して Authorization ヘッダを付与する小ヘルパ。 */
function withToken(
  req: HttpRequest<unknown>,
  token: string,
): HttpRequest<unknown> {
  // HttpRequest は不変なので clone して新しいリクエストを作る。
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

/**
 * 関数型 HTTP Interceptor（Angular 15+ の書き方）。
 * 全リクエストに JWT を付与し、access 失効(401)時は自動で再発行→再送する。
 *
 * 流れ:
 *   1. access があれば付けて送信
 *   2. 401 が返ったら refreshAccessToken() で再発行
 *   3. 新しい access で元リクエストを1回だけ再送（switchMap で繋ぐ）
 *   4. refresh も失敗したらログアウトしてエラーを伝播
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  // トークンが無ければ（未ログイン時）そのまま素通し。
  const authReq = token ? withToken(req, token) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // refresh エンドポイント自身の401は再試行しない（無限ループ防止）
      const isRefreshCall = req.url.includes('/auth/token/refresh');

      if (err.status === 401 && token && !isRefreshCall) {
        return auth.refreshAccessToken().pipe(
          // 新しい access で元リクエストを再送（next を直接呼ぶので
          // Interceptor は二重適用されない）
          switchMap((newAccess) => next(withToken(req, newAccess))),
          catchError((refreshErr) => {
            auth.logout();
            return throwError(() => refreshErr);
          }),
        );
      }

      return throwError(() => err);
    }),
  );
};
