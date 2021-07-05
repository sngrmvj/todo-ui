import { Component, OnInit } from '@angular/core';
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
  
  constructor() { }

  ngOnInit(): void {
  }
  
  toggle(){
    console.log(this.toggleProperty);
    this.toggleProperty = !this.toggleProperty
  }

  


}
