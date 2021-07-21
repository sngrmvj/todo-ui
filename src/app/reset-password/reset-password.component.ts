import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  isPasswordMatch: boolean = false;
  hide:boolean = true;

  
  constructor(private router: Router) { }

  ngOnInit(): void {
  }


  onSubmit(){
    // API Call pass the refresh token so that it contains the DBID. 
    // It will be easy to update the password for the user using the user id
    this.router.navigate(['login'])
  }

}
