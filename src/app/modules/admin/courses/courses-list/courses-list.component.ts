import { AfterViewInit, Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CoursesApiService } from '../../../../api-services/courses/courses-api.service';
import { CourseDto, CoursesPagedQuery } from '../../../../api-services/courses/courses-api.model';
import { BaseComponent } from '../../../../core/components/base-classes/base-component';
import { ToasterService } from '../../../../core/services/toaster.service';
import { FitConfirmDialogComponent } from '../../../shared/components/fit-confirm-dialog/fit-confirm-dialog.component';
import { DialogType, DialogButton, DialogConfig } from '../../../shared/models/dialog-config.model';

@Component({
  selector: 'app-courses-list',
  standalone: false,
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.scss'
})
export class CoursesListComponent extends BaseComponent implements OnInit, AfterViewInit {
  private coursesApi = inject(CoursesApiService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toaster = inject(ToasterService);

  displayedColumns: string[] = ['name', 'categoryName', 'professorName', 'courseDate', 'price', 'actions'];
  data: CourseDto[] = [];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter values (single search term hits backend; category accepted as id)
  filterName = '';
  filterCategoryId: number | null = null;
  private filterChange$ = new Subject<void>();

  isDownloading = false;

  ngOnInit(): void {
    // Debounce text/category filter changes
    this.filterChange$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        if (this.paginator) this.paginator.pageIndex = 0;
        this.pageIndex = 0;
        this.loadCourses();
      });

    this.loadCourses();
  }

  ngAfterViewInit(): void {
    // Reset to first page when sort changes
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });

    merge(this.sort.sortChange, this.paginator.page).subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.loadCourses();
    });
  }

  private buildQuery(): CoursesPagedQuery {
    const orderBy = this.sort?.active || undefined;
    const orderDirection = this.sort?.direction ? (this.sort.direction as 'asc' | 'desc') : undefined;
    return {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
      orderBy,
      orderDirection,
      searchTerm: this.filterName?.trim() || undefined,
      categoryId: this.filterCategoryId ?? undefined,
    };
  }

  loadCourses(): void {
    this.startLoading();
    this.coursesApi.getAllPaged(this.buildQuery()).subscribe({
      next: (result) => {
        this.data = result.items;
        this.totalItems = result.totalItems;
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading courses');
        console.error('Error loading courses', err);
      }
    });
  }

  applyFilter(): void {
    this.filterChange$.next();
  }

  clearFilters(): void {
    this.filterName = '';
    this.filterCategoryId = null;
    this.applyFilter();
  }

  onCreate(): void {
    this.router.navigate(['/admin/courses/new']);
  }

  onEdit(course: CourseDto): void {
    this.router.navigate(['/admin/courses/edit', course.id]);
  }

  onDelete(course: CourseDto): void {
    const dialogConfig: DialogConfig = {
      type: DialogType.QUESTION,
      title: 'Brisanje kursa',
      message: `Da li ste sigurni da želite obrisati kurs "${course.name}"?`,
      buttons: [
        { type: DialogButton.CANCEL, color: 'primary' },
        { type: DialogButton.DELETE, color: 'warn' }
      ]
    };

    const dialogRef = this.dialog.open(FitConfirmDialogComponent, {
      data: dialogConfig,
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.button === DialogButton.DELETE) {
        this.coursesApi.delete(course.id).subscribe({
          next: () => {
            this.toaster.success('Kurs uspješno obrisan');
            this.loadCourses();
          },
          error: (err) => {
            this.toaster.error('Greška pri brisanju kursa');
            console.error('Error deleting course', err);
          }
        });
      }
    });
  }

  downloadPdfReport(): void {
    this.isDownloading = true;
    this.coursesApi.downloadPdfReport().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kursevi-lista-${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
        this.toaster.success('PDF izvjestaj uspjesno preuzet');
      },
      error: (err) => {
        this.isDownloading = false;
        this.toaster.error('Greska pri preuzimanju PDF izvjestaja');
        console.error('Error downloading PDF', err);
      }
    });
  }
}
