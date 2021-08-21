import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../services/project-service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.scss']
})
export class MyprofileComponent implements OnInit {


  isAdmin:any = false;
  panelOpenState = false;
  hide:boolean = true;
  yourDetails:any = {};
  allUserDetails: any = [];

  constructor(private router: Router,private toastMessage:ToastrService, private projectService:ProjectService) { }

  ngOnInit(): void {
    this.areYouAuthorized()
    this.getIsAdmin()
    this.popUserDetails()
    this.allUsers()
  }

  // ----------------------------
  // Form Group 
  // Looks like form directive accepts only one in a view. For multiple "Form Group"
  // ----------------------------
  newPasswordForm = new FormGroup({
    current: new FormControl(''),
    password: new FormControl(''),
    confirm_password : new FormControl('')
  })



  // =====================
  // Update the password 
  // =====================
  passwordUpdate(){
    if (this.newPasswordForm.get("confirm_password")?.value === this.newPasswordForm.get('password')?.value){
      if(this.newPasswordForm.get('password')?.value.length >= 15){
        
      }
    }
  }
  

  // ====================
  // Need to check whether you are authorised or not
  // ====================
  areYouAuthorized(){
    let check_logged_in_value = localStorage.getItem('todo-loggedin');
    if (check_logged_in_value === 'true'){
      this.projectService.checksAuthorization().subscribe((result) =>{
        if(result.flag === false){
          this.toastMessage.warning("You are not Authorized");
          this.router.navigate(['authwall']);
        }
      },(error) =>{
        this.toastMessage.error(error.error.error);
        this.router.navigate(['authwall']);
      })
    }
  }


  // ====================
  // Get IS ADMIN
  // ====================
  getIsAdmin(){
    let value = localStorage.getItem('todo-isAdmin');
    if(value != null){
      this.isAdmin = value;
    }
  }



  // ====================
  // Sign Out from the present one
  // ====================
  signOut(){
    localStorage.setItem('todo-loggedin','false');
    this.router.navigate(['authwall']);
  }


  allUsers(){
    if(this.isAdmin === true){
      this.projectService.getAllDetails().subscribe( (result) =>{
        for (let item in result.message){
          this.allUserDetails.push(result.message[item]);
        }
      }, (error) =>{
        this.toastMessage.error(error.error.error);
      })
    }
  }



  // ====================
  // Delete user
  // ====================
  deleteUser(ids:any){
    if(this.isAdmin === true){
      console.log(ids)
    }
  }

  // ====================
  // Display User details
  // ====================
  popUserDetails(){
    let id_to_be_passed = window.atob(String(localStorage.getItem('todo-id')));
    this.projectService.getUser(id_to_be_passed).subscribe((result) =>{
      this.yourDetails = result.message.content;
    }, (error) =>{
      this.toastMessage.error(error.error.error);
    })
  }



}
