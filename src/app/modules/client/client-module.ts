import { NgModule } from '@angular/core';

import { ClientRoutingModule } from './client-routing-module';
import { SharedModule } from '../shared/shared-module';
import { PublicCoursesModule } from '../public/public-courses-module';

import { ClientLayoutComponent } from './client-layout/client-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyCoursesComponent } from './my-courses/my-courses.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    ClientLayoutComponent,
    DashboardComponent,
    MyCoursesComponent,
    ProfileComponent
  ],
  imports: [
    SharedModule,
    ClientRoutingModule,
    PublicCoursesModule
  ]
})
export class ClientModule { }
