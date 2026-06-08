import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Paginated, Task, TaskQuery } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly base = `${environment.apiUrl}/tasks`;

  // 一覧の状態を signal で保持。コンポーネントはこれを読むだけでUIが追従する。
  private readonly _tasks = signal<Task[]>([]);
  // 外部には読み取り専用として公開（asReadonly で書き換え不可にする）。
  readonly tasks = this._tasks.asReadonly();

  constructor(private http: HttpClient) {}

  /**
   * 一覧取得 → signal を更新。Interceptor がトークンを自動付与する。
   * query で検索/フィルタ/並び替え（バックエンドの django-filter に対応）。
   */
  load(query: TaskQuery = {}): Observable<Paginated<Task>> {
    let params = new HttpParams();
    // 値があるものだけクエリ文字列に積む（空文字や undefined は送らない）
    if (query.search) params = params.set('search', query.search);
    if (query.done !== undefined) params = params.set('done', query.done);
    if (query.category !== undefined) {
      params = params.set('category', query.category);
    }
    if (query.ordering) params = params.set('ordering', query.ordering);

    return this.http
      .get<Paginated<Task>>(`${this.base}/`, { params })
      .pipe(tap((res) => this._tasks.set(res.results)));
  }

  /** 1件取得（詳細・編集画面用）。 */
  get(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}/`);
  }

  /** 作成 → 成功したら先頭に追加（楽観的にUI更新）。 */
  create(data: {
    title: string;
    body: string;
    category?: number | null;
  }): Observable<Task> {
    return this.http
      .post<Task>(`${this.base}/`, data)
      .pipe(tap((created) => this._tasks.update((list) => [created, ...list])));
  }

  /** 部分更新（PATCH）→ 一覧の該当要素を差し替え。 */
  update(id: number, data: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.base}/${id}/`, data).pipe(
      tap((updated) =>
        this._tasks.update((list) =>
          list.map((t) => (t.id === id ? updated : t)),
        ),
      ),
    );
  }

  /** 削除 → 一覧から除去。 */
  remove(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${id}/`)
      .pipe(tap(() => this._tasks.update((list) => list.filter((t) => t.id !== id))));
  }
}
