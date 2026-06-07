import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ログイン/登録（認証不要）
  {
    path: 'login',
    loadComponent: () => import('./auth/login.page').then((m) => m.LoginPage),
  },
  // タスク一覧（要ログイン）。loadComponent で遅延読み込み（コード分割）
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tasks/task-list.page').then((m) => m.TaskListPage),
  },
  // 新規作成。':id' より前に置く（順序が重要）
  {
    path: 'tasks/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tasks/task-form.page').then((m) => m.TaskFormPage),
  },
  // 編集（IDパラメータ付き）
  {
    path: 'tasks/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tasks/task-form.page').then((m) => m.TaskFormPage),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
];
