import { NgModule } from '@angular/core';

import { PublicRoutingModule } from './public-routing-module';
import { PublicCoursesModule } from './public-courses-module';

@NgModule({
  imports: [
    PublicCoursesModule,
    PublicRoutingModule,
  ],
  exports: [
    PublicCoursesModule,
  ]
})
export class PublicModule { }
