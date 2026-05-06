import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacadeService } from '../../../core/services/auth/auth-facade.service';
import { CourseEnrollmentsApiService } from '../../../api-services/course-enrollments/course-enrollments-api.service';
import { NotificationsApiService } from '../../../api-services/notifications/notifications-api.service';
import { CourseEnrollmentDto } from '../../../api-services/course-enrollments/course-enrollments-api.model';
import { NotificationDto } from '../../../api-services/notifications/notifications-api.model';
import { BaseComponent } from '../../../core/components/base-classes/base-component';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent extends BaseComponent implements OnInit {
  private authService = inject(AuthFacadeService);
  private enrollmentsApi = inject(CourseEnrollmentsApiService);
  private notificationsApi = inject(NotificationsApiService);
  private router = inject(Router);

  enrollments: CourseEnrollmentDto[] = [];
  notifications: NotificationDto[] = [];
  userName = '';
  today = new Date();

  // Stats
  totalCourses = 0;
  activeCourses = 0;
  completedCourses = 0;
  pendingPayments = 0;

  // Notification colors for visual variety
  private notificationColors = ['primary', 'success', 'warning', 'info'];

  ngOnInit(): void {
    const user = this.authService.currentUser();
    this.userName = user?.firstname || 'Student';

    if (user?.userId) {
      this.loadEnrollments(user.userId);
    }
    this.loadNotifications();
  }

  private loadEnrollments(studentId: number): void {
    this.startLoading();
    this.enrollmentsApi.getByStudent(studentId).subscribe({
      next: (data) => {
        this.enrollments = data;
        this.calculateStats();
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading enrollments');
        console.error('Error loading enrollments', err);
      }
    });
  }

  private loadNotifications(): void {
    this.notificationsApi.getAll().subscribe({
      next: (data) => this.notifications = data.slice(0, 3),
      error: (err) => console.error('Error loading notifications', err)
    });
  }

  private calculateStats(): void {
    this.totalCourses = this.enrollments.length;

    const now = new Date();
    this.activeCourses = this.enrollments.filter(e => {
      const courseDate = e.courseDate ? new Date(e.courseDate) : null;
      return courseDate && courseDate >= now;
    }).length;

    this.completedCourses = this.enrollments.filter(e => {
      const courseDate = e.courseDate ? new Date(e.courseDate) : null;
      return courseDate && courseDate < now;
    }).length;

    this.pendingPayments = this.enrollments.filter(e => !e.isPaid).length;
  }

  goToMyCourses(): void {
    this.router.navigate(['/client/my-courses']);
  }

  goToProfile(): void {
    this.router.navigate(['/client/profile']);
  }

  goToBrowseCourses(): void {
    this.router.navigate(['/client/browse']);
  }

  viewCourse(enrollment: CourseEnrollmentDto): void {
    this.router.navigate(['/client/course', enrollment.courseId]);
  }

  getNotificationClass(index: number): string {
    return this.notificationColors[index % this.notificationColors.length];
  }
}
