import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoursesApiService } from '../../../api-services/courses/courses-api.service';
import { CourseEnrollmentsApiService } from '../../../api-services/course-enrollments/course-enrollments-api.service';
import { AuthFacadeService } from '../../../core/services/auth/auth-facade.service';
import { CourseDto } from '../../../api-services/courses/courses-api.model';
import { BaseComponent } from '../../../core/components/base-classes/base-component';

@Component({
  selector: 'app-course-details',
  standalone: false,
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss'
})
export class CourseDetailsComponent extends BaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursesApi = inject(CoursesApiService);
  private enrollmentsApi = inject(CourseEnrollmentsApiService);
  private authService = inject(AuthFacadeService);
  private snackBar = inject(MatSnackBar);

  course: CourseDto | null = null;
  isEnrolling = false;

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUserId(): number | null {
    const user = this.authService.currentUser();
    return user?.userId ?? null;
  }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(+courseId);
    } else {
      this.router.navigate(['/courses']);
    }
  }

  private loadCourse(id: number): void {
    this.startLoading();
    this.coursesApi.getById(id).subscribe({
      next: (course) => {
        this.course = course;
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Course not found');
        console.error('Error loading course', err);
      }
    });
  }

  enroll(): void {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please login to enroll in this course', 'Login', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: `/courses/${this.course?.id}` }
        });
      });
      return;
    }

    if (!this.course || !this.currentUserId) return;

    this.isEnrolling = true;
    this.enrollmentsApi.create({
      studentId: this.currentUserId,
      courseId: this.course.id,
      enrollmentDate: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.snackBar.open('Successfully enrolled in the course!', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/client/my-courses']);
      },
      error: (err) => {
        this.isEnrolling = false;
        const message = err.error?.message || 'Failed to enroll. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
        console.error('Enrollment error', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }
}
