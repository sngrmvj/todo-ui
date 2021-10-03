import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder,FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../services/project-service';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  toggleProperty: boolean = false;
  isPasswordMatch: boolean = false;
  hide:boolean = true;
  signUpHide:boolean = true;
  showDetails: boolean = false;
  
  constructor(private fb:FormBuilder,private router: Router,private toastMessage:ToastrService, private projectService: ProjectService) {
    // This is function call.
    this.allowLogin()
  }

  ngOnInit(): void {
  }

  onStrengthChanged(strength: number) {
    console.log('password strength = ', strength);
  }
  showPasswordStrength(){
    this.showDetails = !this.showDetails;
  }


  // ---------------------
  //  It is indeed called everytime. If logged out it allows you to log in else navigated directly to planners
  // ---------------------
  allowLogin(){
    let check_logged_in_value = localStorage.getItem('todo-loggedin');
    if (check_logged_in_value === 'true'){
      this.checkUserValidated()
    }
  }


  // ---------------------
  //  It is needed to bypass the user from logging in again and again.
  // ---------------------
  checkUserValidated(){
    this.projectService.getAccessToken().subscribe((result) =>{
      if(result.flag === true){
        this.router.navigate(['planners']);
      }
    }, (error)=>{
      if(error.status === 401){
        this.toastMessage.warning(error.error.message);
      }
      // else{
      //   this.toastMessage.error(error.error.error);
      // }
    })
  }



  // ----------------------------
  // Form Group 
  // Looks like form directive accepts only one in a view. For multiple "Form Group"
  // ----------------------------
  reactiveForm = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirm_password : new FormControl('')
  })
  


  // -------------------
  // This is important for flip of view
  // -------------------
  toggle(){
    this.toggleProperty = !this.toggleProperty
  }


  // --------------------
  // Sign In
  // --------------------
  login(signInItem:any){

    if (!signInItem.email || !signInItem.password){
      this.toastMessage.warning("Please enter the email and password");
    }
    else{
      let payload = {
        "content":{
          "email" : signInItem.email,
          "password" : signInItem.password
        }
      }
      this.projectService.login(payload).subscribe((result) =>{
        this.toastMessage.success(result.body.message);
        localStorage.setItem('todo-id',window.btoa(result.body.id));
        localStorage.setItem('todo-isAdmin',result.body.admin);
        localStorage.setItem('todo-loggedin','true');
        this.router.navigate(['planners']);
      }, (error) =>{
        if(error.status === 400){
          this.toastMessage.warning(error.error.error);
        }
        else{
          this.toastMessage.error(error.error.error);
        }
      })
    }
  }




  // ------------------------
  // Sign Up Function 
  // ------------------------
  registration(): void{
    if(!this.reactiveForm.get('firstname')?.value || !this.reactiveForm.get('lastname')?.value || !this.reactiveForm.get('email')?.value || !this.reactiveForm.get('password')?.value){
      this.toastMessage.warning("Please enter the mandatory fields")
    }
    else{
      if (this.reactiveForm.get("confirm_password")?.value === this.reactiveForm.get('password')?.value){
        if (this.reactiveForm.get('password')?.value.length >= 15){
          let payload = {
            "content": {
              "firstname": this.reactiveForm.get('firstname')?.value,
              "lastname" : this.reactiveForm.get('lastname')?.value,
              "email" : this.reactiveForm.get('email')?.value,
              "password": this.reactiveForm.get('password')?.value
            }
          }
          this.projectService.register(payload).subscribe( (result) => {
            this.toastMessage.success(result.message);
            this.reactiveForm.reset();
            this.toggleProperty = !this.toggleProperty;
          }, (error) =>{
            this.toastMessage.warning("Kindly contact the Admin !!");
            this.toastMessage.error(error.error.warning);
          })
        }
        else{
          this.toastMessage.warning("Passwords length is less than 15 characters");
        }
      }
      else{
        this.toastMessage.warning("Passwords don't match");
      }
    }
  }
  


}
