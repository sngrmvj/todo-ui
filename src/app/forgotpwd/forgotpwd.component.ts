import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forgotpwd',
  templateUrl: './forgotpwd.component.html',
  styleUrls: ['./forgotpwd.component.scss']
})
export class ForgotpwdComponent implements OnInit {

  otpSend:boolean = true;
  email:string = "";
  validateOTP:string = "";
  

  constructor() { }

  ngOnInit(): void {
  }

  startTimer(){
    if (this.otpSend === false){
      console.log("OTP has been sent. Please wait for 2 minutes")
      setTimeout(()=>{
        this.otpSend = true;
        console.log("You can resend the OTP")
      }, 60000);
    }
  }

  sendOTP(){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (this.email != ""){
      if (re.test(String(this.email).toLowerCase())){
        if (this.otpSend != false){
          console.log("Ready to send OTP")
          this.otpSend = false
          this.startTimer()
        }

        // Make an api call by sending the email to the Server.
        // Server validates it and send OTP if the email exists
      }
      else{
        console.log("Invalid Email")
      }
    }
    else{
      console.log("Please enter email")
    }
  }


  validationOfOTP(){
    if (this.validateOTP){
      // Make an API call to the server 
    }
  }

}
