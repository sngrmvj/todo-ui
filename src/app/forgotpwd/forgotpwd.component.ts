import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-forgotpwd',
  templateUrl: './forgotpwd.component.html',
  styleUrls: ['./forgotpwd.component.scss']
})
export class ForgotpwdComponent implements OnInit {

  otpSent:boolean = false;
  email:string = "";
  validateOTP:string = "";
  

  constructor(private router: Router, private toastMessage:ToastrService) { }

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

  sendOTP(){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (this.email != ""){
      if (re.test(String(this.email).toLowerCase())){
        if (this.otpSent === false ){
          this.otpSent = true
          //Need to make an api call for generating the mail to send the OTP. 
          // Once the message from API call is obtained then we can trigger the below timer
          // Add the sent otp to the local_storage
          let otp = ""
          localStorage.setItem(this.email, otp);
          this.toastMessage.success("OTP successfully send to the registered email");
          this.startTimer();
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
      let otp = localStorage.getItem(this.email);
      if (otp === this.validateOTP){
        this.toastMessage.success("OTP is correct");
        localStorage.removeItem(this.email);
        this.router.navigate(['reset'])
      }
      else{
        this.toastMessage.error("OTP is not valid");
      }
    }
    else{
      this.toastMessage.warning("Please enter the OTP");
    }
  }

}
