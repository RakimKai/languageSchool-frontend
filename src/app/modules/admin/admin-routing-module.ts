import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';

// Courses
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { CourseFormComponent } from './courses/course-form/course-form.component';

// Exams
import { ExamsListComponent } from './exams/exams-list/exams-list.component';
import { ExamFormComponent } from './exams/exam-form/exam-form.component';

// Enrollments
import { EnrollmentsListComponent } from './enrollments/enrollments-list/enrollments-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'settings',
        component: AdminSettingsComponent,
      },
      // Courses routes
      {
        path: 'courses',
        component: CoursesListComponent,
      },
      {
        path: 'courses/new',
        component: CourseFormComponent,
      },
      {
        path: 'courses/edit/:id',
        component: CourseFormComponent,
      },
      // Exams routes
      {
        path: 'exams',
        component: ExamsListComponent,
      },
      {
        path: 'exams/new',
        component: ExamFormComponent,
      },
      {
        path: 'exams/edit/:id',
        component: ExamFormComponent,
      },
      // Enrollments routes
      {
        path: 'enrollments',
        component: EnrollmentsListComponent,
      },
      // default admin route → /admin/courses
      {
        path: '',
        redirectTo: 'courses',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
