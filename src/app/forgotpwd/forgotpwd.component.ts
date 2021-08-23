import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../services/general-service';
import { ProjectService } from '../services/project-service';
@Component({
  selector: 'app-forgotpwd',
  templateUrl: './forgotpwd.component.html',
  styleUrls: ['./forgotpwd.component.scss']
})
export class ForgotpwdComponent implements OnInit {

  otpSent:boolean = false;
  message:string = "";
  email:string = "";
  validateOTP:string = "";
  

  constructor(private router: Router, private toastMessage:ToastrService,private messageService:DataService,private projectService: ProjectService) { }

  ngOnInit(): void {
  }

  startTimer(){
    if (this.otpSent === true){
      setTimeout(()=>{
        this.otpSent = false;
        this.toastMessage.warning("You can resend the OTP");
      }, 60000);
    }
  }



  // ====================
  // Send OTP to the concerned person
  // ====================
  sendOTP(){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (this.email != ""){
      if (re.test(String(this.email).toLowerCase())){
        if (this.otpSent === false ){
          this.otpSent = true
          let payload ={
            'content' :{
              'email' : this.email
            }
          }
          this.projectService.emailOTP(payload).subscribe((result) =>{
            this.toastMessage.success(result.message);
            this.startTimer();
          }, (error)=>{
            if(error.status === 404){
              this.toastMessage.warning(error.error.message);
            }
            else{
              this.toastMessage.error(error.error.error);
            }
          })
        }
        else{
          this.toastMessage.warning("OTP has been already sent");
          this.toastMessage.warning("Please wait for 2 minutes.");
        }
      }
      else{
        console.log("Invalid Email");
        this.toastMessage.warning("Invalid email. Try again");
      }
    }
    else{
      this.toastMessage.warning("Please enter the email");
    }
  }


  validationOfOTP(){
    if (this.validateOTP){
      let payload = {
        'content' : {
          'otp' : this.validateOTP
        }
      }
      this.projectService.validateSentOTP(payload).subscribe((result)=>{
        this.toastMessage.success(result.message);
        this.messageService.changeMessage(this.email);
        this.router.navigate(['reset']);
      },(error)=>{
        if(error.status === 400){
          this.toastMessage.warning(error.error.earning);
        }
        else{
          this.toastMessage.error(error.error.error);
        }
      })
    }
    else{
      this.toastMessage.warning("Please enter the OTP");
    }
  }

}
