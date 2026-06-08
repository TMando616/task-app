import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { RefresherCustomEvent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, logOutOutline } from 'ionicons/icons';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { AuthService } from '../core/services/auth.service';
import { CategoryService } from '../core/services/category.service';
import { Task, TaskQuery } from '../core/models/task.model';
import { TaskService } from '../core/services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: 'task-list.page.html',
  styleUrls: ['task-list.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonNote,
    IonCheckbox,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class TaskListPage implements OnInit {
  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  // サービスの signal をそのままテンプレートで購読する（tasks() / categories()）
  readonly tasks = this.taskService.tasks;
  readonly categories = this.categoryService.categories;

  // 検索ボックスの入力。FormControl で値の流れを Observable 化できる
  readonly searchControl = new FormControl('', { nonNullable: true });
  // カテゴリ絞り込み（null = すべて）
  categoryFilter: number | null = null;

  constructor() {
    // 使うアイコンを登録（standalone では明示登録が必要）
    addIcons({ add, logOutOutline });

    // インクリメンタル検索:
    //   debounceTime       … 入力が300ms落ち着いてから発火（毎打鍵では叩かない）
    //   distinctUntilChanged … 同じ語の連続は無視
    //   switchMap          … 前の検索が未完了でも新入力に乗り換え、古い結果を捨てる
    // signal だけでは難しい「非同期ストリームの制御」を RxJS が担う部分。
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.taskService.load(this.buildQuery(term))),
        takeUntilDestroyed(), // コンポーネント破棄時に自動で購読解除
      )
      .subscribe();
  }

  ngOnInit(): void {
    // 画面表示時にカテゴリと一覧を取得（subscribe しないとHTTPは飛ばない）
    this.categoryService.load().subscribe();
    this.taskService.load().subscribe();
  }

  /** 現在の検索語・カテゴリから一覧APIの絞り込み条件を組み立てる。 */
  private buildQuery(search = this.searchControl.value): TaskQuery {
    const query: TaskQuery = {};
    if (search) query.search = search;
    if (this.categoryFilter !== null) query.category = this.categoryFilter;
    return query;
  }

  /** カテゴリ絞り込みの変更時に再取得。 */
  onCategoryChange(value: number | null): void {
    this.categoryFilter = value;
    this.taskService.load(this.buildQuery()).subscribe();
  }

  /** チェックボックスで完了状態をトグル。 */
  toggleDone(task: Task): void {
    this.taskService.update(task.id, { done: !task.done }).subscribe();
  }

  openNew(): void {
    this.router.navigate(['/tasks/new']);
  }

  openDetail(task: Task): void {
    this.router.navigate(['/tasks', task.id]);
  }

  remove(task: Task): void {
    this.taskService.remove(task.id).subscribe(() => {
      this.showToast(`「${task.title}」を削除しました`);
    });
  }

  /**
   * プルダウン更新（ion-refresher）。
   * 取得完了後に event.target.complete() でスピナーを閉じる必要がある。
   */
  doRefresh(event: RefresherCustomEvent): void {
    this.taskService.load(this.buildQuery()).subscribe({
      next: () => event.target.complete(),
      error: () => event.target.complete(),
    });
  }

  /** 画面下部に数秒だけ出る通知（ToastController）。 */
  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
