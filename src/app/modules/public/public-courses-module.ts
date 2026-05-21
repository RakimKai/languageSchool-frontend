import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CoursesBrowseComponent } from './courses-browse/courses-browse.component';
import { CourseDetailsComponent } from './course-details/course-details.component';
import { SharedModule } from '../shared/shared-module';

/**
 * Routing-less feature module for the public-facing course browsing components.
 * Imported by both PublicModule (which adds routes) and ClientModule
 * (which reuses the components inside its own routes), so neither has to
 * import a routed module from the other.
 */
@NgModule({
  declarations: [
    CoursesBrowseComponent,
    CourseDetailsComponent,
  ],
  imports: [
    SharedModule,
    RouterModule,
  ],
  exports: [
    CoursesBrowseComponent,
    CourseDetailsComponent,
  ]
})
export class PublicCoursesModule { }
