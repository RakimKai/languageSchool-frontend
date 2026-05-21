import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CourseCategoryDto,
  CreateCourseCategoryDto,
  UpdateCourseCategoryDto
} from './course-categories-api.model';

@Injectable({
  providedIn: 'root'
})
export class CourseCategoriesApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/CourseCategories`;
  private http = inject(HttpClient);

  getAll(): Observable<CourseCategoryDto[]> {
    return this.http.get<CourseCategoryDto[]>(this.baseUrl);
  }

  getEnabled(): Observable<CourseCategoryDto[]> {
    return this.http.get<CourseCategoryDto[]>(`${this.baseUrl}/enabled`);
  }

  getById(id: number): Observable<CourseCategoryDto> {
    return this.http.get<CourseCategoryDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateCourseCategoryDto): Observable<number> {
    return this.http.post<number>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateCourseCategoryDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/toggle-status`, {});
  }
}
