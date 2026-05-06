import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CoursesApiService } from '../../../../api-services/courses/courses-api.service';
import { CourseDto } from '../../../../api-services/courses/courses-api.model';
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
export class CoursesListComponent extends BaseComponent implements OnInit {
  private coursesApi = inject(CoursesApiService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toaster = inject(ToasterService);

  displayedColumns: string[] = ['name', 'categoryName', 'professorName', 'courseDate', 'price', 'actions'];
  dataSource = new MatTableDataSource<CourseDto>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter values
  filterName = '';
  filterCategory = '';
  filterProfessor = '';

  // PDF download state
  isDownloading = false;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.startLoading();
    this.coursesApi.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.setupFilter();
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading courses');
        console.error('Error loading courses', err);
      }
    });
  }

  private setupFilter(): void {
    this.dataSource.filterPredicate = (data: CourseDto, filter: string) => {
      const searchTerms = JSON.parse(filter);
      const matchesName = !searchTerms.name ||
        data.name.toLowerCase().includes(searchTerms.name.toLowerCase());
      const matchesCategory = !searchTerms.category ||
        (data.categoryName?.toLowerCase().includes(searchTerms.category.toLowerCase()) ?? false);
      const matchesProfessor = !searchTerms.professor ||
        (data.professorName?.toLowerCase().includes(searchTerms.professor.toLowerCase()) ?? false);
      return matchesName && matchesCategory && matchesProfessor;
    };
  }

  applyFilter(): void {
    const filterValue = JSON.stringify({
      name: this.filterName,
      category: this.filterCategory,
      professor: this.filterProfessor
    });
    this.dataSource.filter = filterValue;
  }

  clearFilters(): void {
    this.filterName = '';
    this.filterCategory = '';
    this.filterProfessor = '';
    this.dataSource.filter = '';
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
