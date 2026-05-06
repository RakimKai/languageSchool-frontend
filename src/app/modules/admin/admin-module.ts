import {NgModule} from '@angular/core';

import {AdminRoutingModule} from './admin-routing-module';
import {AdminLayoutComponent} from './admin-layout/admin-layout.component';
import {AdminSettingsComponent} from './admin-settings/admin-settings.component';
import {SharedModule} from '../shared/shared-module';

// Courses
import {CoursesListComponent} from './courses/courses-list/courses-list.component';
import {CourseFormComponent} from './courses/course-form/course-form.component';

// Exams
import {ExamsListComponent} from './exams/exams-list/exams-list.component';
import {ExamFormComponent} from './exams/exam-form/exam-form.component';

// Enrollments
import {EnrollmentsListComponent} from './enrollments/enrollments-list/enrollments-list.component';


@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminSettingsComponent,
    // Courses
    CoursesListComponent,
    CourseFormComponent,
    // Exams
    ExamsListComponent,
    ExamFormComponent,
    // Enrollments
    EnrollmentsListComponent,
  ],
  imports: [
    AdminRoutingModule,
    SharedModule,
  ]
})
export class AdminModule { }
