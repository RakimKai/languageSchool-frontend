import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ExamDto,
  CreateExamDto,
  UpdateExamDto
} from './exams-api.model';

@Injectable({
  providedIn: 'root'
})
export class ExamsApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/Exams`;
  private http = inject(HttpClient);

  getAll(): Observable<ExamDto[]> {
    return this.http.get<ExamDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<ExamDto> {
    return this.http.get<ExamDto>(`${this.baseUrl}/${id}`);
  }

  getByCourse(courseId: number): Observable<ExamDto[]> {
    return this.http.get<ExamDto[]>(`${this.baseUrl}/course/${courseId}`);
  }

  create(payload: CreateExamDto): Observable<ExamDto> {
    return this.http.post<ExamDto>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateExamDto): Observable<ExamDto> {
    return this.http.put<ExamDto>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
