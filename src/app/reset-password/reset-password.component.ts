import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  isPasswordMatch: boolean = true;
  isLengthSatisfied: boolean = true;
  lengthMismatchString: string = "";
  hide:boolean = true;

  
  constructor(private router: Router) { }

  ngOnInit(): void {
  }


  onSubmit(resetForm:any){
    if(resetForm.password === resetForm.confirm_password ){
      if (resetForm.password.length >= 15){
      // API Call pass the refresh token so that it contains the DBID. 
      // It will be easy to update the password for the user using the user id
      this.router.navigate(['login'])
      }
      else{
        this.isLengthSatisfied = false;
        this.lengthMismatchString = `The length of the password should be 15 characters.`;
      }
    }
    else{
      this.isPasswordMatch = false;
    }
  }

}
