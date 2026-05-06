import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AuthFacadeService } from '../../../core/services/auth/auth-facade.service';
import { CourseEnrollmentsApiService } from '../../../api-services/course-enrollments/course-enrollments-api.service';
import { CourseEnrollmentDto } from '../../../api-services/course-enrollments/course-enrollments-api.model';
import { BaseComponent } from '../../../core/components/base-classes/base-component';

@Component({
  selector: 'app-my-courses',
  standalone: false,
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss'
})
export class MyCoursesComponent extends BaseComponent implements OnInit {
  private authService = inject(AuthFacadeService);
  private enrollmentsApi = inject(CourseEnrollmentsApiService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  enrollments: CourseEnrollmentDto[] = [];
  filteredEnrollments: CourseEnrollmentDto[] = [];

  // Table columns
  displayedColumns: string[] = ['course', 'startDate', 'status', 'certificate', 'actions'];

  // Filters
  filterStatus: 'all' | 'active' | 'completed' | 'unpaid' = 'all';
  selectedTabIndex = 0;

  // Certificate download state
  downloadingCertificates: Set<number> = new Set();

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.userId) {
      this.loadEnrollments(user.userId);
    }
  }

  private loadEnrollments(studentId: number): void {
    this.startLoading();
    this.enrollmentsApi.getByStudent(studentId).subscribe({
      next: (data) => {
        this.enrollments = data;
        this.applyFilter();
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading your courses');
        console.error('Error loading enrollments', err);
      }
    });
  }

  applyFilter(): void {
    const now = new Date();

    switch (this.filterStatus) {
      case 'active':
        this.filteredEnrollments = this.enrollments.filter(e => {
          const courseDate = e.courseDate ? new Date(e.courseDate) : null;
          return courseDate && courseDate >= now;
        });
        break;
      case 'completed':
        this.filteredEnrollments = this.enrollments.filter(e => {
          const courseDate = e.courseDate ? new Date(e.courseDate) : null;
          return courseDate && courseDate < now;
        });
        break;
      case 'unpaid':
        this.filteredEnrollments = this.enrollments.filter(e => !e.isPaid);
        break;
      default:
        this.filteredEnrollments = [...this.enrollments];
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    const statusMap: ('all' | 'active' | 'completed' | 'unpaid')[] = ['all', 'active', 'completed', 'unpaid'];
    this.filterStatus = statusMap[event.index];
    this.selectedTabIndex = event.index;
    this.applyFilter();
  }

  onFilterChange(status: 'all' | 'active' | 'completed' | 'unpaid'): void {
    this.filterStatus = status;
    const statusMap = { 'all': 0, 'active': 1, 'completed': 2, 'unpaid': 3 };
    this.selectedTabIndex = statusMap[status];
    this.applyFilter();
  }

  // Count methods
  getActiveCount(): number {
    const now = new Date();
    return this.enrollments.filter(e => {
      const courseDate = e.courseDate ? new Date(e.courseDate) : null;
      return courseDate && courseDate >= now;
    }).length;
  }

  getCompletedCount(): number {
    const now = new Date();
    return this.enrollments.filter(e => {
      const courseDate = e.courseDate ? new Date(e.courseDate) : null;
      return courseDate && courseDate < now;
    }).length;
  }

  getUnpaidCount(): number {
    return this.enrollments.filter(e => !e.isPaid).length;
  }

  isCompleted(enrollment: CourseEnrollmentDto): boolean {
    if (!enrollment.courseDate) return false;
    return new Date(enrollment.courseDate) < new Date();
  }

  canDownloadCertificate(enrollment: CourseEnrollmentDto): boolean {
    return this.isCompleted(enrollment) && enrollment.isPaid;
  }

  downloadCertificate(enrollment: CourseEnrollmentDto): void {
    if (this.downloadingCertificates.has(enrollment.id)) return;

    this.downloadingCertificates.add(enrollment.id);

    this.enrollmentsApi.getCertificate(enrollment.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Potvrda_${enrollment.courseName?.replace(/\s+/g, '_')}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.downloadingCertificates.delete(enrollment.id);
        this.snackBar.open('Potvrda uspjesno preuzeta!', 'Zatvori', { duration: 3000 });
      },
      error: (err) => {
        this.downloadingCertificates.delete(enrollment.id);
        this.snackBar.open('Neuspjesno preuzimanje potvrde. Pokusajte ponovo.', 'Zatvori', { duration: 5000 });
        console.error('Error downloading certificate', err);
      }
    });
  }

  isDownloading(enrollmentId: number): boolean {
    return this.downloadingCertificates.has(enrollmentId);
  }

  viewCourseDetails(enrollment: CourseEnrollmentDto): void {
    this.router.navigate(['/courses', enrollment.courseId]);
  }

  browseCourses(): void {
    this.router.navigate(['/courses']);
  }

  getStatusClass(enrollment: CourseEnrollmentDto): string {
    if (!enrollment.isPaid) return 'status-unpaid';
    if (this.isCompleted(enrollment)) return 'status-completed';
    return 'status-active';
  }

  getStatusText(enrollment: CourseEnrollmentDto): string {
    if (!enrollment.isPaid) return 'Ceka placanje';
    if (this.isCompleted(enrollment)) return 'Zavrsen';
    return 'Aktivan';
  }

  getEmptyStateText(): string {
    switch (this.filterStatus) {
      case 'active': return 'aktivnih';
      case 'completed': return 'zavrsenih';
      case 'unpaid': return 'neplacenih';
      default: return '';
    }
  }
}
