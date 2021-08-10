import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  isPasswordMatch: boolean = true;
  hide:boolean = true;

  
  constructor(private router: Router,private toastMessage:ToastrService) { }

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
        this.toastMessage.warning("Length of password should be 15 chars");
      }
    }
    else{
      this.toastMessage.warning("Passwords did not match");
    }
  }

}
