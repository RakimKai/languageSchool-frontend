import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ExamsApiService } from '../../../../api-services/exams/exams-api.service';
import { ExamDto } from '../../../../api-services/exams/exams-api.model';
import { BaseComponent } from '../../../../core/components/base-classes/base-component';
import { ToasterService } from '../../../../core/services/toaster.service';
import { FitConfirmDialogComponent } from '../../../shared/components/fit-confirm-dialog/fit-confirm-dialog.component';
import { DialogType, DialogButton, DialogConfig } from '../../../shared/models/dialog-config.model';

@Component({
  selector: 'app-exams-list',
  standalone: false,
  templateUrl: './exams-list.component.html',
  styleUrl: './exams-list.component.scss'
})
export class ExamsListComponent extends BaseComponent implements OnInit {
  private examsApi = inject(ExamsApiService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toaster = inject(ToasterService);

  displayedColumns: string[] = ['name', 'courseName', 'examDate', 'price', 'actions'];
  dataSource = new MatTableDataSource<ExamDto>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter values
  filterName = '';
  filterCourse = '';

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.startLoading();
    this.examsApi.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.setupFilter();
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading exams');
        console.error('Error loading exams', err);
      }
    });
  }

  private setupFilter(): void {
    this.dataSource.filterPredicate = (data: ExamDto, filter: string) => {
      const searchTerms = JSON.parse(filter);
      const matchesName = !searchTerms.name ||
        data.name.toLowerCase().includes(searchTerms.name.toLowerCase());
      const matchesCourse = !searchTerms.course ||
        (data.courseName?.toLowerCase().includes(searchTerms.course.toLowerCase()) ?? false);
      return matchesName && matchesCourse;
    };
  }

  applyFilter(): void {
    const filterValue = JSON.stringify({
      name: this.filterName,
      course: this.filterCourse
    });
    this.dataSource.filter = filterValue;
  }

  clearFilters(): void {
    this.filterName = '';
    this.filterCourse = '';
    this.dataSource.filter = '';
  }

  onCreate(): void {
    this.router.navigate(['/admin/exams/new']);
  }

  onEdit(exam: ExamDto): void {
    this.router.navigate(['/admin/exams/edit', exam.id]);
  }

  onDelete(exam: ExamDto): void {
    const dialogConfig: DialogConfig = {
      type: DialogType.QUESTION,
      title: 'Brisanje ispita',
      message: `Da li ste sigurni da želite obrisati ispit "${exam.name}"?`,
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
        this.examsApi.delete(exam.id).subscribe({
          next: () => {
            this.toaster.success('Ispit uspješno obrisan');
            this.loadExams();
          },
          error: (err) => {
            this.toaster.error('Greška pri brisanju ispita');
            console.error('Error deleting exam', err);
          }
        });
      }
    });
  }
}
