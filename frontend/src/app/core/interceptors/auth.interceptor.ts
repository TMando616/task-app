import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

/**
 * 関数型 HTTP Interceptor（Angular 15+ の書き方）。
 * すべての送信リクエストに Authorization ヘッダを自動付与する。
 * React には無い概念で、認証トークンの付け忘れを構造的に防げるのが利点。
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getAccessToken();

  // トークンが無ければ（未ログイン時）そのまま素通し。
  if (!token) {
    return next(req);
  }

  // HttpRequest は不変なので clone して新しいリクエストを作る。
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};
