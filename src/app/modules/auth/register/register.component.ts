import { Component, inject, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../core/components/base-classes/base-component';
import { AuthApiService } from '../../../api-services/auth/auth-api.service';
import { AuthStorageService } from '../../../core/services/auth/auth-storage.service';
import { AuthFacadeService } from '../../../core/services/auth/auth-facade.service';
import { RegisterCommand } from '../../../api-services/auth/auth-api.model';
import { RecaptchaService } from '../../../core/services/recaptcha.service';

// Password strength validator
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  const isLongEnough = value.length >= 8;

  const errors: ValidationErrors = {};

  if (!isLongEnough) errors['minLength'] = true;
  if (!hasUpperCase) errors['noUpperCase'] = true;
  if (!hasLowerCase) errors['noLowerCase'] = true;
  if (!hasNumeric) errors['noNumber'] = true;
  if (!hasSpecialChar) errors['noSpecialChar'] = true;

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent extends BaseComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);
  private authStorage = inject(AuthStorageService);
  private authFacade = inject(AuthFacadeService);
  private router = inject(Router);
  private recaptchaService = inject(RecaptchaService);

  hidePassword = true;
  hideConfirmPassword = true;

  // reCAPTCHA state
  captchaVerified = false;
  captchaToken: string | null = null;
  recaptchaWidgetId: number | null = null;
  recaptchaError = false;

  @ViewChild('recaptchaContainer') recaptchaContainer!: ElementRef<HTMLDivElement>;

  get isRecaptchaEnabled(): boolean {
    return this.recaptchaService.isEnabled;
  }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required]],
    firstname: ['', [Validators.required, Validators.maxLength(100)]],
    lastname: ['', [Validators.required, Validators.maxLength(100)]],
    phoneNumber: [''],
  });

  // Password strength calculation
  get passwordStrength(): { level: number; text: string; color: string } {
    const password = this.form.get('password')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, text: 'Slaba', color: '#f44336' };
    if (strength <= 4) return { level: 2, text: 'Srednja', color: '#ff9800' };
    if (strength <= 5) return { level: 3, text: 'Dobra', color: '#8bc34a' };
    return { level: 4, text: 'Jaka', color: '#4caf50' };
  }

  get passwordRequirements(): { text: string; met: boolean }[] {
    const password = this.form.get('password')?.value || '';
    return [
      { text: 'Minimalno 8 karaktera', met: password.length >= 8 },
      { text: 'Jedno veliko slovo (A-Z)', met: /[A-Z]/.test(password) },
      { text: 'Jedno malo slovo (a-z)', met: /[a-z]/.test(password) },
      { text: 'Jedan broj (0-9)', met: /[0-9]/.test(password) },
      { text: 'Jedan specijalni karakter (!@#$...)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  }

  ngAfterViewInit(): void {
    if (this.isRecaptchaEnabled) {
      this.initRecaptcha();
    } else {
      this.captchaVerified = true;
    }
  }

  ngOnDestroy(): void {
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

    // Check passwords match
    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.startLoading();

    const payload: RegisterCommand = {
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
      firstname: this.form.value.firstname ?? '',
      lastname: this.form.value.lastname ?? '',
      phoneNumber: this.form.value.phoneNumber || null,
      fingerprint: null,
      recaptchaToken: this.captchaToken,
    };

    this.authApi.register(payload).subscribe({
      next: (response) => {
        // Persist tokens and update auth signals so guards see the user as authenticated
        this.authFacade.setSession(response.accessToken, response.refreshToken);

        this.stopLoading();
        // Registered users are students by default; admin route is gated
        this.router.navigate([this.authFacade.isAdmin() ? '/admin' : '/client/browse']);
      },
      error: (err) => {
        const message = err.error?.message || 'Registration failed. Please try again.';
        this.stopLoading(message);
        console.error('Register error:', err);
        this.resetCaptcha();
      },
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
