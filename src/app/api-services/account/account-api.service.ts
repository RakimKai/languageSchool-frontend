import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/Account`;
  private http = inject(HttpClient);

  activate(token: string): Observable<unknown> {
    const params = new HttpParams().set('token', token);
    return this.http.get(`${this.baseUrl}/activate`, { params });
  }

  forgotPassword(email: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token, newPassword });
  }

  resendActivation(email: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/resend-activation`, { email });
  }
}
