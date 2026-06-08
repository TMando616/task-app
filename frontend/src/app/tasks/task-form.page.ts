import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { CategoryService } from '../core/services/category.service';
import { TaskService } from '../core/services/task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: 'task-form.page.html',
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonContent,
    IonItem,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
  ],
})
export class TaskFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // 編集対象のID（新規なら null）。URLパラメータから判定する
  readonly editId = signal<number | null>(null);
  readonly loading = signal(false);
  // カテゴリ選択肢（signal をそのままテンプレートで読む）
  readonly categories = this.categoryService.categories;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    body: [''],
    // 任意。未選択は null（＝未分類）
    category: [null as number | null],
  });

  ngOnInit(): void {
    // 選択肢用にカテゴリ一覧を取得
    this.categoryService.load().subscribe();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editId.set(id);
      // 既存タスクを取得してフォームに反映
      this.taskService.get(id).subscribe((task) => {
        this.form.patchValue({
          title: task.title,
          body: task.body,
          category: task.category,
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const value = this.form.getRawValue();
    const id = this.editId();

    // 編集なら update、新規なら create を呼ぶ
    const request$ = id
      ? this.taskService.update(id, value)
      : this.taskService.create(value);

    request$.subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: () => this.loading.set(false),
    });
  }
}
