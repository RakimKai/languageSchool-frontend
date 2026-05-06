import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CourseEnrollmentDto,
  CreateCourseEnrollmentDto,
  UpdatePaymentStatusDto
} from './course-enrollments-api.model';

@Injectable({
  providedIn: 'root'
})
export class CourseEnrollmentsApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/CourseEnrollments`;
  private http = inject(HttpClient);

  getByStudent(studentId: number): Observable<CourseEnrollmentDto[]> {
    return this.http.get<CourseEnrollmentDto[]>(`${this.baseUrl}/by-student/${studentId}`);
  }

  getByCourse(courseId: number): Observable<CourseEnrollmentDto[]> {
    return this.http.get<CourseEnrollmentDto[]>(`${this.baseUrl}/by-course/${courseId}`);
  }

  create(payload: CreateCourseEnrollmentDto): Observable<number> {
    return this.http.post<number>(this.baseUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updatePaymentStatus(id: number, payload: UpdatePaymentStatusDto): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/payment-status`, payload);
  }

  getCertificate(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/certificate`, {
      responseType: 'blob'
    });
  }
}
