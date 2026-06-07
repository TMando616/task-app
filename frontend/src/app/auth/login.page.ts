import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  // standalone コンポーネントは使うものを imports に列挙する（NgModule の代わり）
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonText,
  ],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // 画面の状態は signal で持つ（テンプレートから mode() のように呼ぶ）
  readonly mode = signal<'login' | 'register'>('login');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  // Reactive Forms: フォームの状態をTS側で型安全に管理する
  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();

    if (this.mode() === 'register') {
      // 登録 → そのまま続けてログイン
      this.auth.register(username, password).subscribe({
        next: () => this.doLogin(username, password),
        error: () => this.fail('登録に失敗しました（ユーザー名が重複の可能性）'),
      });
    } else {
      this.doLogin(username, password);
    }
  }

  private doLogin(username: string, password: string): void {
    this.auth.login(username, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/tasks');
      },
      error: () => this.fail('ログインに失敗しました'),
    });
  }

  private fail(message: string): void {
    this.loading.set(false);
    this.error.set(message);
  }
}
