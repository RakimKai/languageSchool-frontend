import { Component, inject, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../core/components/base-classes/base-component';
import { AuthFacadeService } from '../../../core/services/auth/auth-facade.service';
import { LoginCommand } from '../../../api-services/auth/auth-api.model';
import { CurrentUserService } from '../../../core/services/auth/current-user.service';
import { RecaptchaService } from '../../../core/services/recaptcha.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent extends BaseComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private auth = inject(AuthFacadeService);
  private router = inject(Router);
  private currentUser = inject(CurrentUserService);
  private recaptchaService = inject(RecaptchaService);
  hidePassword = true;

  // reCAPTCHA state
  captchaVerified = false;
  captchaToken: string | null = null;
  recaptchaWidgetId: number | null = null;
  recaptchaError = false;

  @ViewChild('recaptchaContainer') recaptchaContainer!: ElementRef<HTMLDivElement>;

  form = this.fb.group({
    email: ['admin@languageschool.local', [Validators.required, Validators.email]],
    password: ['Admin123!', [Validators.required]],
    rememberMe: [false],
  });

  get isRecaptchaEnabled(): boolean {
    return this.recaptchaService.isEnabled;
  }

  ngAfterViewInit(): void {
    if (this.isRecaptchaEnabled) {
      this.initRecaptcha();
    } else {
      // If reCAPTCHA is disabled, mark as verified
      this.captchaVerified = true;
    }
  }

  ngOnDestroy(): void {
    // Reset reCAPTCHA widget on component destroy
    if (this.recaptchaWidgetId !== null) {
      this.recaptchaService.reset(this.recaptchaWidgetId);
    }
  }

  private initRecaptcha(): void {
    setTimeout(() => {
      if (this.recaptchaContainer?.nativeElement) {
        this.recaptchaService.render(
          this.recaptchaContainer.nativeElement,
          (token: string) => this.onCaptchaSuccess(token),
          () => this.onCaptchaExpired(),
          () => this.onCaptchaError()
        ).then(widgetId => {
          this.recaptchaWidgetId = widgetId;
        }).catch(err => {
          console.error('Failed to render reCAPTCHA:', err);
          this.recaptchaError = true;
        });
      }
    }, 100);
  }

  private onCaptchaSuccess(token: string): void {
    this.captchaToken = token;
    this.captchaVerified = true;
    this.recaptchaError = false;
  }

  private onCaptchaExpired(): void {
    this.captchaToken = null;
    this.captchaVerified = false;
  }

  private onCaptchaError(): void {
    this.captchaToken = null;
    this.captchaVerified = false;
    this.recaptchaError = true;
  }

  resetCaptcha(): void {
    if (this.recaptchaWidgetId !== null) {
      this.recaptchaService.reset(this.recaptchaWidgetId);
      this.captchaToken = null;
      this.captchaVerified = false;
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) return;
    if (this.isRecaptchaEnabled && !this.captchaVerified) return;

    this.startLoading();

    const payload: LoginCommand = {
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
      fingerprint: null,
      recaptchaToken: this.captchaToken,
    };

    this.auth.login(payload).subscribe({
      next: () => {
        this.stopLoading();
        const target = this.currentUser.getDefaultRoute();
        this.router.navigate([target]);
      },
      error: (err) => {
        this.stopLoading('Invalid credentials. Please try again.');
        console.error('Login error:', err);
        // Reset captcha on error
        this.resetCaptcha();
      },
    });
  }
}
