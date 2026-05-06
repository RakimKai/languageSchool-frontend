import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CoursesBrowseComponent } from './courses-browse/courses-browse.component';
import { CourseDetailsComponent } from './course-details/course-details.component';

const routes: Routes = [
  { path: '', component: CoursesBrowseComponent },
  { path: ':id', component: CourseDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
