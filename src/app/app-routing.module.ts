import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ErrorComponent } from './error/error.component';
import { ForgotpwdComponent } from './forgotpwd/forgotpwd.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { MyprofileComponent } from './myprofile/myprofile.component';
import { PlannersComponent } from './planners/planners.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';

const routes: Routes = [
  {
    path: '',
    component: SplashScreenComponent
  },
  {
    path: 'splash',
    component: SplashScreenComponent
  },
  {
    path: 'authwall',
    component: LoginComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'planners',
    component: PlannersComponent
  },
  {
    path: 'forgotpwd',
    component: ForgotpwdComponent
  },
  {
    path: 'reset',
    component: ResetPasswordComponent
  },
  {
    path: 'myprofile',
    component: MyprofileComponent
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
