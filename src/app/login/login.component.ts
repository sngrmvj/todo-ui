import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  ismyTextFieldType: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
  }

  signin: FormGroup = new FormGroup({
    // email: new FormControl('', [Validators.email, Validators.required ]),
    password: new FormControl('', [Validators.required, Validators.min(3) ])
  });

  get passwordInput() { return this.signin.get('password'); } 

}
