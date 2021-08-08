import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  toggleProperty: boolean = false;
  isPasswordMatch: boolean = false;
  hide:boolean = true;
  
  constructor(private router: Router) { }

  ngOnInit(): void {
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
    let payload = {
      "content":{
        "email" : signInItem.email,
        "password" : signInItem.password
      }
    }
    console.log(payload);
    this.router.navigate(['planners'])
  }

  signMeUp(): void{
    let payload = {
      "content": {
        "firstname": this.reactiveForm.get('firstname')?.value,
        "lastname" : this.reactiveForm.get('lastname')?.value,
        "email" : this.reactiveForm.get('email')?.value,
        "password": this.reactiveForm.get('password')?.value
      }
    }
    console.log("SignUp Payload -",payload);
  }
  


}
