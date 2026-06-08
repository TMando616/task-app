import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Category, Paginated } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly base = `${environment.apiUrl}/categories`;

  // カテゴリ一覧を signal で保持（フィルタUIや作成画面のselectで使う）。
  private readonly _categories = signal<Category[]>([]);
  readonly categories = this._categories.asReadonly();

  constructor(private http: HttpClient) {}

  /** 一覧取得 → signal を更新。 */
  load(): Observable<Paginated<Category>> {
    return this.http
      .get<Paginated<Category>>(`${this.base}/`)
      .pipe(tap((res) => this._categories.set(res.results)));
  }

  /** 作成 → 成功したら末尾に追加。 */
  create(name: string): Observable<Category> {
    return this.http
      .post<Category>(`${this.base}/`, { name })
      .pipe(tap((created) => this._categories.update((l) => [...l, created])));
  }
}
