import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
  
  constructor(private router: Router,private toastMessage:ToastrService, private projectService: ProjectService) { }

  ngOnInit(): void {
  }

  checkUserValidated(){
    this.projectService.getAccessToken().subscribe((result) =>{
      console.log(result);
    }, (error)=>{
      this.toastMessage.error(error.error.error);
    })
  }

  reactiveForm = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirm_password : new FormControl('')
  })
  
  toggle(){
    this.toggleProperty = !this.toggleProperty
  }

  signMeIn(signInItem:any){

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
        this.router.navigate(['planners']);
      }, (error) =>{
        console.log(error)
        this.toastMessage.error(error.error)
      })
      
    }
  }

  signMeUp(): void{

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
            this.toastMessage.success(result)
          }, (error) =>{
            this.toastMessage.error(error)
            this.toastMessage.warning("Kindly contact the Admin !!")
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
