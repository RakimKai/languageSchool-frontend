import {NgModule} from '@angular/core';

import {PublicRoutingModule} from './public-routing-module';
import {CoursesBrowseComponent} from './courses-browse/courses-browse.component';
import {CourseDetailsComponent} from './course-details/course-details.component';
import {SharedModule} from '../shared/shared-module';


@NgModule({
  declarations: [
    CoursesBrowseComponent,
    CourseDetailsComponent,
  ],
  imports: [
    SharedModule,
    PublicRoutingModule,
  ],
  exports: [
    CoursesBrowseComponent,
    CourseDetailsComponent,
  ]
})
export class PublicModule { }
