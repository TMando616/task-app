// バックエンドの TaskSerializer と対応する型定義。
export interface Task {
  id: number;
  owner: string;
  title: string;
  body: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

// DRF のページネーション応答（{count, next, previous, results}）の型。
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
