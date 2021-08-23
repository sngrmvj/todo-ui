import { Component, OnInit } from '@angular/core';
import { Data, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../services/project-service';
import { DataService } from '../services/general-service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  isPasswordMatch: boolean = true;
  hide:boolean = true;
  userEmail: string = "";

  
  constructor(private router: Router,private toastMessage:ToastrService,private projectService: ProjectService,private messageService: DataService) { }

  ngOnInit(): void {
    this.messageService.currentMessage.subscribe(message => this.userEmail=message);
  }


  onSubmit(resetForm:any){
    if(resetForm.password === resetForm.confirm_password ){
      if (resetForm.password.length >= 15){
        let payload={
          'content':{
            'password':resetForm.password,
            'email': this.userEmail
          }
        }
        this.projectService.forgotPassword(payload).subscribe((result)=>{
          this.toastMessage.success(result.message);
          this.router.navigate(['authwall']);
        },(error)=>{
          if(error.status){
            this.toastMessage.warning(error.error.message);
          }
          else{
            this.toastMessage.error(error.error.error);
          }
        })
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
