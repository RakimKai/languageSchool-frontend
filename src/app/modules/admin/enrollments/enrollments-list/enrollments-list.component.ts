import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CourseEnrollmentsApiService } from '../../../../api-services/course-enrollments/course-enrollments-api.service';
import { CoursesApiService } from '../../../../api-services/courses/courses-api.service';
import { CourseEnrollmentDto } from '../../../../api-services/course-enrollments/course-enrollments-api.model';
import { CourseDto } from '../../../../api-services/courses/courses-api.model';
import { BaseComponent } from '../../../../core/components/base-classes/base-component';
import { FitConfirmDialogComponent } from '../../../shared/components/fit-confirm-dialog/fit-confirm-dialog.component';
import { DialogConfig, DialogType, DialogButton, DialogResult } from '../../../shared/models/dialog-config.model';

@Component({
  selector: 'app-enrollments-list',
  standalone: false,
  templateUrl: './enrollments-list.component.html',
  styleUrl: './enrollments-list.component.scss'
})
export class EnrollmentsListComponent extends BaseComponent implements OnInit {
  private enrollmentsApi = inject(CourseEnrollmentsApiService);
  private coursesApi = inject(CoursesApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  courses: CourseDto[] = [];
  enrollments: CourseEnrollmentDto[] = [];
  filteredEnrollments: CourseEnrollmentDto[] = [];

  // Filters
  selectedCourseId: number | null = null;
  filterPaidStatus: 'all' | 'paid' | 'unpaid' = 'all';
  searchTerm = '';

  // Table columns
  displayedColumns = ['select', 'student', 'course', 'enrollmentDate', 'status', 'paymentDate', 'actions'];

  // Selection state
  selectedEnrollments: CourseEnrollmentDto[] = [];

  // Processing state
  processingPayments: Set<number> = new Set();

  ngOnInit(): void {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.coursesApi.getAll().subscribe({
      next: (courses) => {
        this.courses = courses;
        if (courses.length > 0) {
          this.selectedCourseId = courses[0].id;
          this.loadEnrollments();
        }
      },
      error: (err) => console.error('Error loading courses', err)
    });
  }

  loadEnrollments(): void {
    if (!this.selectedCourseId) return;

    this.startLoading();
    this.enrollmentsApi.getByCourse(this.selectedCourseId).subscribe({
      next: (data) => {
        this.enrollments = data;
        this.applyFilters();
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading enrollments');
        console.error('Error loading enrollments', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.enrollments];

    // Filter by paid status
    if (this.filterPaidStatus === 'paid') {
      filtered = filtered.filter(e => e.isPaid);
    } else if (this.filterPaidStatus === 'unpaid') {
      filtered = filtered.filter(e => !e.isPaid);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.studentName?.toLowerCase().includes(term) ||
        e.studentEmail?.toLowerCase().includes(term)
      );
    }

    this.filteredEnrollments = filtered;
  }

  onCourseChange(): void {
    this.loadEnrollments();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterPaidStatus = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  togglePaymentStatus(enrollment: CourseEnrollmentDto): void {
    if (this.processingPayments.has(enrollment.id)) return;

    const newStatus = !enrollment.isPaid;
    const action = newStatus ? 'oznaciti kao placeno' : 'oznaciti kao neplaceno';

    const dialogConfig: DialogConfig = {
      type: DialogType.QUESTION,
      title: 'Promjena statusa placanja',
      message: `Da li zelite ${action} za ${enrollment.studentName}?`,
      buttons: [
        { type: DialogButton.CANCEL, label: 'Odustani', color: 'primary' },
        { type: DialogButton.OK, label: 'Potvrdi', color: 'primary' }
      ]
    };

    const dialogRef = this.dialog.open(FitConfirmDialogComponent, { data: dialogConfig });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result?.button === DialogButton.OK) {
        this.updatePaymentStatus(enrollment, newStatus);
      }
    });
  }

  private updatePaymentStatus(enrollment: CourseEnrollmentDto, isPaid: boolean): void {
    this.processingPayments.add(enrollment.id);

    this.enrollmentsApi.updatePaymentStatus(enrollment.id, { isPaid }).subscribe({
      next: () => {
        enrollment.isPaid = isPaid;
        enrollment.paymentDate = isPaid ? new Date().toISOString() : null;
        this.processingPayments.delete(enrollment.id);
        this.snackBar.open(
          `Payment status updated to ${isPaid ? 'Paid' : 'Unpaid'}`,
          'Close',
          { duration: 3000 }
        );
      },
      error: (err) => {
        this.processingPayments.delete(enrollment.id);
        this.snackBar.open('Failed to update payment status', 'Close', { duration: 5000 });
        console.error('Error updating payment status', err);
      }
    });
  }

  isProcessing(enrollmentId: number): boolean {
    return this.processingPayments.has(enrollmentId);
  }

  deleteEnrollment(enrollment: CourseEnrollmentDto): void {
    const dialogConfig: DialogConfig = {
      type: DialogType.QUESTION,
      title: 'Brisanje upisa',
      message: `Da li ste sigurni da zelite obrisati upis za ${enrollment.studentName} u kurs ${enrollment.courseName}?`,
      buttons: [
        { type: DialogButton.CANCEL, label: 'Odustani', color: 'primary' },
        { type: DialogButton.DELETE, label: 'Obrisi', color: 'warn' }
      ]
    };

    const dialogRef = this.dialog.open(FitConfirmDialogComponent, { data: dialogConfig });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result?.button === DialogButton.DELETE) {
        this.performDelete(enrollment);
      }
    });
  }

  private performDelete(enrollment: CourseEnrollmentDto): void {
    this.enrollmentsApi.delete(enrollment.id).subscribe({
      next: () => {
        this.enrollments = this.enrollments.filter(e => e.id !== enrollment.id);
        this.applyFilters();
        this.snackBar.open('Enrollment deleted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to delete enrollment', 'Close', { duration: 5000 });
        console.error('Error deleting enrollment', err);
      }
    });
  }

  // Selection methods
  toggleSelection(enrollment: CourseEnrollmentDto): void {
    const index = this.selectedEnrollments.findIndex(e => e.id === enrollment.id);
    if (index >= 0) {
      this.selectedEnrollments.splice(index, 1);
    } else {
      this.selectedEnrollments.push(enrollment);
    }
  }

  isSelected(enrollment: CourseEnrollmentDto): boolean {
    return this.selectedEnrollments.some(e => e.id === enrollment.id);
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedEnrollments = [...this.filteredEnrollments];
    } else {
      this.selectedEnrollments = [];
    }
  }

  isAllSelected(): boolean {
    return this.filteredEnrollments.length > 0 &&
           this.selectedEnrollments.length === this.filteredEnrollments.length;
  }

  markSelectedAsPaid(): void {
    if (this.selectedEnrollments.length === 0) return;

    const unpaidSelected = this.selectedEnrollments.filter(e => !e.isPaid);
    if (unpaidSelected.length === 0) {
      this.snackBar.open('Svi odabrani upisi su vec placeni', 'Zatvori', { duration: 3000 });
      return;
    }

    const dialogConfig: DialogConfig = {
      type: DialogType.QUESTION,
      title: 'Potvrdi placanje',
      message: `Da li zelite oznaciti ${unpaidSelected.length} upis(a) kao placeno?`,
      buttons: [
        { type: DialogButton.CANCEL, label: 'Odustani', color: 'primary' },
        { type: DialogButton.OK, label: 'Potvrdi', color: 'primary' }
      ]
    };

    const dialogRef = this.dialog.open(FitConfirmDialogComponent, { data: dialogConfig });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result?.button === DialogButton.OK) {
        this.processBulkPayment(unpaidSelected);
      }
    });
  }

  private processBulkPayment(enrollments: CourseEnrollmentDto[]): void {
    let completed = 0;
    const total = enrollments.length;

    enrollments.forEach(enrollment => {
      this.enrollmentsApi.updatePaymentStatus(enrollment.id, { isPaid: true }).subscribe({
        next: () => {
          enrollment.isPaid = true;
          enrollment.paymentDate = new Date().toISOString();
          completed++;
          if (completed === total) {
            this.selectedEnrollments = [];
            this.snackBar.open(`${total} upis(a) oznaceno kao placeno`, 'Zatvori', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error('Error updating payment status', err);
        }
      });
    });
  }

  // Stats
  get totalEnrollments(): number {
    return this.enrollments.length;
  }

  get paidEnrollments(): number {
    return this.enrollments.filter(e => e.isPaid).length;
  }

  get unpaidEnrollments(): number {
    return this.enrollments.filter(e => !e.isPaid).length;
  }
}
