import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesApiService } from '../../../../api-services/courses/courses-api.service';
import { CourseCategoriesApiService } from '../../../../api-services/course-categories/course-categories-api.service';
import { CourseCategoryDto } from '../../../../api-services/course-categories/course-categories-api.model';
import { CreateCourseDto, UpdateCourseDto } from '../../../../api-services/courses/courses-api.model';
import { BaseComponent } from '../../../../core/components/base-classes/base-component';
import { ToasterService } from '../../../../core/services/toaster.service';

@Component({
  selector: 'app-course-form',
  standalone: false,
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.scss'
})
export class CourseFormComponent extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursesApi = inject(CoursesApiService);
  private categoriesApi = inject(CourseCategoriesApiService);
  private toaster = inject(ToasterService);

  form!: FormGroup;
  isEditMode = false;
  courseId: number | null = null;
  categories: CourseCategoryDto[] = [];
  isSaving = false;

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.checkEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(1000)],
      courseDate: ['', Validators.required],
      courseType: ['', Validators.maxLength(100)],
      numberOfClasses: [null, [Validators.min(1), Validators.max(500)]],
      durationInHours: [null, [Validators.min(1), Validators.max(1000)]],
      professorName: ['', Validators.maxLength(200)],
      maxStudents: [null, [Validators.min(1), Validators.max(1000)]],
      price: [null, [Validators.min(0), Validators.max(100000)]],
      categoryId: [null, Validators.required]
    });
  }

  private loadCategories(): void {
    this.categoriesApi.getEnabled().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories', err)
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.courseId = +id;
      this.loadCourse();
    }
  }

  private loadCourse(): void {
    if (!this.courseId) return;

    this.startLoading();
    this.coursesApi.getById(this.courseId).subscribe({
      next: (course) => {
        this.form.patchValue({
          name: course.name,
          description: course.description,
          courseDate: course.courseDate ? new Date(course.courseDate) : null,
          courseType: course.courseType,
          numberOfClasses: course.numberOfClasses,
          durationInHours: course.durationInHours,
          professorName: course.professorName,
          maxStudents: course.maxStudents,
          price: course.price,
          categoryId: course.categoryId
        });
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading course');
        console.error('Error loading course', err);
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

    // Format date to ISO string
    const courseDate = formValue.courseDate instanceof Date
      ? formValue.courseDate.toISOString()
      : formValue.courseDate;

    if (this.isEditMode && this.courseId) {
      const payload: UpdateCourseDto = {
        id: this.courseId,
        name: formValue.name,
        description: formValue.description || null,
        courseDate: courseDate,
        courseType: formValue.courseType || null,
        numberOfClasses: formValue.numberOfClasses || null,
        durationInHours: formValue.durationInHours || null,
        professorName: formValue.professorName || null,
        maxStudents: formValue.maxStudents || null,
        price: formValue.price || null,
        categoryId: formValue.categoryId
      };

      this.coursesApi.update(this.courseId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toaster.success('Course updated successfully');
          this.router.navigate(['/admin/courses']);
        },
        error: (err) => {
          this.isSaving = false;
          this.toaster.error('Error updating course');
          console.error('Error updating course', err);
        }
      });
    } else {
      const payload: CreateCourseDto = {
        name: formValue.name,
        description: formValue.description || null,
        courseDate: courseDate,
        courseType: formValue.courseType || null,
        numberOfClasses: formValue.numberOfClasses || null,
        durationInHours: formValue.durationInHours || null,
        professorName: formValue.professorName || null,
        maxStudents: formValue.maxStudents || null,
        price: formValue.price || null,
        categoryId: formValue.categoryId
      };

      this.coursesApi.create(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.toaster.success('Course created successfully');
          this.router.navigate(['/admin/courses']);
        },
        error: (err) => {
          this.isSaving = false;
          this.toaster.error('Error creating course');
          console.error('Error creating course', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/courses']);
  }

  // Helper for form validation messages
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
