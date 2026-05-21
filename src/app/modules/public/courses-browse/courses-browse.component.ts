import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { CourseCategoriesApiService } from '../../../api-services/course-categories/course-categories-api.service';
import { CoursesApiService } from '../../../api-services/courses/courses-api.service';
import { CourseCategoryDto } from '../../../api-services/course-categories/course-categories-api.model';
import { CourseDto, CoursesPagedQuery } from '../../../api-services/courses/courses-api.model';
import { BaseComponent } from '../../../core/components/base-classes/base-component';
import { AuthFacadeService } from '../../../core/services/auth/auth-facade.service';

@Component({
  selector: 'app-courses-browse',
  standalone: false,
  templateUrl: './courses-browse.component.html',
  styleUrl: './courses-browse.component.scss'
})
export class CoursesBrowseComponent extends BaseComponent implements OnInit, OnDestroy {
  private categoriesApi = inject(CourseCategoriesApiService);
  private coursesApi = inject(CoursesApiService);
  private router = inject(Router);
  private authService = inject(AuthFacadeService);
  private destroy$ = new Subject<void>();

  categories: CourseCategoryDto[] = [];
  courses: CourseDto[] = [];

  // Pagination
  totalCount = 0;
  pageSize = 9;
  pageIndex = 0;
  pageSizeOptions = [6, 9, 12, 24];

  // Filters
  selectedCategoryId: number | null = null;
  searchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: string = 'courseDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Autocomplete
  searchControl = new FormControl('');
  autocompleteSuggestions: CourseDto[] = [];
  isLoadingAutocomplete = false;

  ngOnInit(): void {
    // Redirect logged-in users to client browse page with sidebar
    if (this.authService.isAuthenticated() && !this.router.url.includes('/client/')) {
      this.router.navigate(['/client/browse']);
      return;
    }

    this.loadCategories();
    this.loadCourses();
    this.setupAutocomplete();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupAutocomplete(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(value => {
        const searchValue = typeof value === 'string' ? value : '';
        this.searchTerm = searchValue;
        if (searchValue.length < 2) {
          this.autocompleteSuggestions = [];
          return of(null);
        }
        this.isLoadingAutocomplete = true;
        const query: CoursesPagedQuery = {
          page: 1,
          pageSize: 5,
          searchTerm: searchValue
        };
        return this.coursesApi.getAllPaged(query);
      })
    ).subscribe({
      next: (result) => {
        this.isLoadingAutocomplete = false;
        if (result) {
          this.autocompleteSuggestions = result.items;
        }
      },
      error: () => {
        this.isLoadingAutocomplete = false;
        this.autocompleteSuggestions = [];
      }
    });
  }

  displayFn(course: CourseDto | string): string {
    if (typeof course === 'string') return course;
    return course?.name || '';
  }

  onAutocompleteSelect(course: CourseDto): void {
    const basePath = this.authService.isAuthenticated() ? '/client/course' : '/courses';
    this.router.navigate([basePath, course.id]);
  }

  private loadCategories(): void {
    this.categoriesApi.getEnabled().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadCourses(): void {
    this.startLoading();

    const query: CoursesPagedQuery = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      orderBy: this.sortBy,
      orderDirection: this.sortDirection
    };

    if (this.selectedCategoryId) {
      query.categoryId = this.selectedCategoryId;
    }

    if (this.searchTerm.trim()) {
      query.searchTerm = this.searchTerm.trim();
    }

    if (this.minPrice != null) {
      query.minPrice = this.minPrice;
    }
    if (this.maxPrice != null) {
      query.maxPrice = this.maxPrice;
    }

    this.coursesApi.getAllPaged(query).subscribe({
      next: (result) => {
        this.courses = result.items;
        this.totalCount = result.totalItems;
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading courses');
        console.error('Error loading courses', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCourses();
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.pageIndex = 0;
    this.loadCourses();
  }

  onSearch(): void {
    this.searchTerm = typeof this.searchControl.value === 'string'
      ? this.searchControl.value
      : '';
    this.pageIndex = 0;
    this.loadCourses();
  }

  clearFilters(): void {
    this.selectedCategoryId = null;
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'courseDate';
    this.sortDirection = 'desc';
    this.searchControl.setValue('');
    this.pageIndex = 0;
    this.loadCourses();
  }

  onSortChange(sortBy: string, sortDirection: 'asc' | 'desc'): void {
    this.sortBy = sortBy;
    this.sortDirection = sortDirection;
    this.pageIndex = 0;
    this.loadCourses();
  }

  onPriceFilterChange(): void {
    this.pageIndex = 0;
    this.loadCourses();
  }

  onCourseClick(course: CourseDto): void {
    const basePath = this.authService.isAuthenticated() ? '/client/course' : '/courses';
    this.router.navigate([basePath, course.id]);
  }
}
