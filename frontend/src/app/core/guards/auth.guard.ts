import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * 関数型ルートガード。未ログインなら /login へリダイレクトする。
 * 認証が必要なページの canActivate に指定して使う。
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  // UrlTree を返すとそのURLへリダイレクトされる。
  return router.createUrlTree(['/login']);
};
