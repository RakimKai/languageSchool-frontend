import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserDto,
  UpdateUserDto,
  ProfileImageUploadResponse
} from './users-api.model';

@Injectable({
  providedIn: 'root'
})
export class UsersApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/Users`;
  private http = inject(HttpClient);

  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/${id}`);
  }

  update(id: number, payload: UpdateUserDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  uploadProfileImage(userId: number, file: File): Observable<ProfileImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ProfileImageUploadResponse>(
      `${this.baseUrl}/${userId}/profile-image`,
      formData
    );
  }

  getProfileImageUrl(path: string | null): string | null {
    if (!path) return null;
    // Accept any of: absolute URL, "/uploads/..." (already-prefixed by backend), or raw storage path like "images/abc.png"
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith('/uploads/')
      ? path
      : `/uploads/${path.replace(/^\/+/, '')}`;
    return `${environment.apiUrl}${normalized}`;
  }
}
