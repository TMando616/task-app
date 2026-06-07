import { Component, inject, OnInit } from '@angular/core';
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
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, logOutOutline } from 'ionicons/icons';

import { AuthService } from '../core/services/auth.service';
import { Task } from '../core/models/task.model';
import { TaskService } from '../core/services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: 'task-list.page.html',
  styleUrls: ['task-list.page.scss'],
  imports: [
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
    IonCheckbox,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class TaskListPage implements OnInit {
  private taskService = inject(TaskService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // サービスの signal をそのままテンプレートで購読する（tasks() で読める）
  readonly tasks = this.taskService.tasks;

  constructor() {
    // 使うアイコンを登録（standalone では明示登録が必要）
    addIcons({ add, logOutOutline });
  }

  ngOnInit(): void {
    // 画面表示時に一覧を取得（subscribe しないとHTTPは飛ばない）
    this.taskService.load().subscribe();
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
    this.taskService.remove(task.id).subscribe();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
