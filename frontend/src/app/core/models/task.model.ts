// バックエンドの CategorySerializer と対応する型定義。
export interface Category {
  id: number;
  owner: string;
  name: string;
  created_at: string;
}

// バックエンドの TaskSerializer と対応する型定義。
export interface Task {
  id: number;
  owner: string;
  category: number | null; // カテゴリID（書き込み用）
  category_name: string | null; // カテゴリ名（表示用・読み取り専用）
  title: string;
  body: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

// 一覧APIに渡す絞り込み条件。すべて任意。
export interface TaskQuery {
  search?: string;
  done?: boolean;
  category?: number;
  ordering?: string;
}

// DRF のページネーション応答（{count, next, previous, results}）の型。
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
