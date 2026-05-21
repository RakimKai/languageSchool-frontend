import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NotificationDto,
  CreateNotificationDto,
  UpdateNotificationDto
} from './notifications-api.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationsApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/Notifications`;
  private http = inject(HttpClient);

  getAll(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<NotificationDto> {
    return this.http.get<NotificationDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateNotificationDto): Observable<number> {
    return this.http.post<number>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateNotificationDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
