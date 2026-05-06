import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamsApiService } from '../../../../api-services/exams/exams-api.service';
import { CoursesApiService } from '../../../../api-services/courses/courses-api.service';
import { CourseDto } from '../../../../api-services/courses/courses-api.model';
import { CreateExamDto, UpdateExamDto } from '../../../../api-services/exams/exams-api.model';
import { BaseComponent } from '../../../../core/components/base-classes/base-component';
import { ToasterService } from '../../../../core/services/toaster.service';

@Component({
  selector: 'app-exam-form',
  standalone: false,
  templateUrl: './exam-form.component.html',
  styleUrl: './exam-form.component.scss'
})
export class ExamFormComponent extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examsApi = inject(ExamsApiService);
  private coursesApi = inject(CoursesApiService);
  private toaster = inject(ToasterService);

  form!: FormGroup;
  isEditMode = false;
  examId: number | null = null;
  courses: CourseDto[] = [];
  isSaving = false;

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
    this.checkEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      examDate: ['', Validators.required],
      price: [null, [Validators.min(0), Validators.max(100000)]],
      courseId: [null, Validators.required]
    });
  }

  private loadCourses(): void {
    this.coursesApi.getAll().subscribe({
      next: (data) => this.courses = data,
      error: (err) => console.error('Error loading courses', err)
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.examId = +id;
      this.loadExam();
    }
  }

  private loadExam(): void {
    if (!this.examId) return;

    this.startLoading();
    this.examsApi.getById(this.examId).subscribe({
      next: (exam) => {
        this.form.patchValue({
          name: exam.name,
          examDate: exam.examDate ? new Date(exam.examDate) : null,
          price: exam.price,
          courseId: exam.courseId
        });
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading exam');
        console.error('Error loading exam', err);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.form.value;

    const examDate = formValue.examDate instanceof Date
      ? formValue.examDate.toISOString()
      : formValue.examDate;

    if (this.isEditMode && this.examId) {
      const payload: UpdateExamDto = {
        id: this.examId,
        name: formValue.name,
        examDate: examDate,
        price: formValue.price || null,
        courseId: formValue.courseId
      };

      this.examsApi.update(this.examId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toaster.success('Exam updated successfully');
          this.router.navigate(['/admin/exams']);
        },
        error: (err) => {
          this.isSaving = false;
          this.toaster.error('Error updating exam');
          console.error('Error updating exam', err);
        }
      });
    } else {
      const payload: CreateExamDto = {
        name: formValue.name,
        examDate: examDate,
        price: formValue.price || null,
        courseId: formValue.courseId
      };

      this.examsApi.create(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toaster.success('Exam created successfully');
          this.router.navigate(['/admin/exams']);
        },
        error: (err) => {
          this.isSaving = false;
          this.toaster.error('Error creating exam');
          console.error('Error creating exam', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/exams']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) return `${fieldName} is required`;
    if (control.hasError('maxlength')) return `${fieldName} is too long`;
    if (control.hasError('min')) return `${fieldName} must be positive`;
    if (control.hasError('max')) return `${fieldName} is too large`;

    return '';
  }
}
