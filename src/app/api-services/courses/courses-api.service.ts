import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResult } from '../../core/models/paging/page-result';
import {
  CourseDto,
  CreateCourseDto,
  UpdateCourseDto,
  CoursesPagedQuery
} from './courses-api.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/Courses`;
  private http = inject(HttpClient);

  getAll(): Observable<CourseDto[]> {
    return this.http.get<CourseDto[]>(this.baseUrl);
  }

  getAllPaged(query: CoursesPagedQuery): Observable<PageResult<CourseDto>> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('pageSize', query.pageSize.toString());

    if (query.orderBy) params = params.set('orderBy', query.orderBy);
    if (query.orderDirection) params = params.set('orderDirection', query.orderDirection);
    if (query.categoryId) params = params.set('categoryId', query.categoryId.toString());
    if (query.searchTerm) params = params.set('searchTerm', query.searchTerm);

    return this.http.get<PageResult<CourseDto>>(`${this.baseUrl}/paged`, { params });
  }

  search(term: string, maxResults: number = 10): Observable<CourseDto[]> {
    const params = new HttpParams()
      .set('q', term)
      .set('maxResults', maxResults.toString());
    return this.http.get<CourseDto[]>(`${this.baseUrl}/search`, { params });
  }

  getById(id: number): Observable<CourseDto> {
    return this.http.get<CourseDto>(`${this.baseUrl}/${id}`);
  }

  getByCategory(categoryId: number): Observable<CourseDto[]> {
    return this.http.get<CourseDto[]>(`${this.baseUrl}/by-category/${categoryId}`);
  }

  create(payload: CreateCourseDto): Observable<number> {
    return this.http.post<number>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateCourseDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  downloadPdfReport(categoryId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get(`${this.baseUrl}/report/pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
