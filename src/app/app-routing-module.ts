import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {myAuthData, myAuthGuard} from './core/guards/my-auth-guard';

const routes: Routes = [
  {
    path: 'admin',
    canActivate: [myAuthGuard],
    data: myAuthData({ requireAuth: true, requireAdmin: true }),
    loadChildren: () =>
      import('./modules/admin/admin-module').then(m => m.AdminModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'client',
    canActivate: [myAuthGuard],
    data: myAuthData({ requireAuth: true }),// bilo ko logiran
    loadChildren: () =>
      import('./modules/client/client-module').then(m => m.ClientModule)
  },
  {
    path: 'courses',
    loadChildren: () =>
      import('./modules/public/public-module').then(m => m.PublicModule)
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  // fallback 404
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
