import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AccountApiService } from '../../../api-services/account/account-api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private accountApi = inject(AccountApiService);

  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;

    const email = this.form.value.email ?? '';
    this.accountApi.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Ako nalog postoji, email za reset lozinke je poslan.';
        this.form.reset();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Greška pri slanju zahtjeva. Pokušajte ponovo.';
      },
    });
  }
}
