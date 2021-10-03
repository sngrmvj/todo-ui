import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { ErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainComponent } from './main/main.component';
import { AboutComponent } from './about/about.component';
import { PlannersComponent } from './planners/planners.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { ForgotpwdComponent } from './forgotpwd/forgotpwd.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MyprofileComponent } from './myprofile/myprofile.component';
import { ToastrModule } from 'ngx-toastr';
import { ProjectService } from './services/project-service';
import { DataService } from './services/general-service';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DialogComponent } from './dialog/dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    ErrorComponent,
    LoginComponent,
    MainComponent,
    AboutComponent,
    PlannersComponent,
    ForgotpwdComponent,
    ResetPasswordComponent,
    MyprofileComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSlideToggleModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatButtonModule,
    MatCardModule,
    HttpClientModule,
    MatPasswordStrengthModule,
    FormsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule,
    BrowserAnimationsModule
  ],
  entryComponents:[DialogComponent],
  providers: [ProjectService,DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
