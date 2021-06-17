import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';

const routes: Routes = [
  {
    path: '',
    component: SplashScreenComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'to-do',
    component: MainComponent
  },
  {
    path: '**',
    component: ErrorComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
