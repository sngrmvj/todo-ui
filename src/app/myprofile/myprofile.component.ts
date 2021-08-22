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

  newFirstnameForm = new FormGroup({
    firstname: new FormControl('')
  })

  newLastnameForm = new FormGroup({
    lastname: new FormControl('')
  })

  newEmailForm = new FormGroup({
    email: new FormControl('')
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





  // =====================
  // Update the firstname 
  // =====================
  firstnameUpdate(){
    if(this.newFirstnameForm.get('firstname')?.value != "" || this.newFirstnameForm.get('firstname')?.value != null){
      let ids = localStorage.getItem('todo-id');
      if (ids != null){
        let payload = {
          'content':{
            'firstname' : this.newFirstnameForm.get('firstname')?.value,
            'id': window.atob(ids),
          }
        }
        this.projectService.updateUserfirstname(payload).subscribe((result) =>{
          this.toastMessage.success(result.message);
          this.newFirstnameForm.reset();
          this.allUsers();
          this.popUserDetails();
        },(error)=>{
          this.toastMessage.error(error.error.error);
        })
      }
    }
  }



  // =====================
  // Update the lastname 
  // =====================
  lastnameUpdate(){
    if(this.newLastnameForm.get('lastname')?.value != "" || this.newLastnameForm.get('lastname')?.value != null){
      let ids = localStorage.getItem('todo-id');
      if (ids != null){
        let payload = {
          'content':{
            'lastname' : this.newLastnameForm.get('lastname')?.value,
            'id': window.atob(ids),
          }
        }
        this.projectService.updateUserlastname(payload).subscribe((result) =>{
          this.toastMessage.success(result.message);
          this.newLastnameForm.reset();
          this.allUsers();
          this.popUserDetails();
        },(error)=>{
          this.toastMessage.error(error.error.error);
        })
      }
    }
  }


  // =====================
  // Update the Email 
  // =====================
  emailUpdate(){
    if(this.newEmailForm.get('firstname')?.value != "" || this.newEmailForm.get('firstname')?.value != null){
      let ids = localStorage.getItem('todo-id');
    }
  }


  
  // ====================
  // Delete user
  // ====================
  deleteUser(ids:any){
    if(this.isAdmin === true){
      // console.log(ids)
      // Need to ask for confirmation.
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
      if(value === 'false'){
        this.isAdmin = false
      }
      else{
        this.isAdmin = true
      }
    }
  }



  // ====================
  // Sign Out from the present one
  // ====================
  signOut(){
    localStorage.setItem('todo-loggedin','false');
    localStorage.removeItem('todo-isAdmin');
    this.router.navigate(['authwall']);
  }


  allUsers(){
    if(this.isAdmin === true){
      this.projectService.getAllDetails().subscribe( (result) =>{
        if(this.allUserDetails.length > 0){
          this.allUserDetails.length = 0;
        }
        for (let item in result.message){
          this.allUserDetails.push(result.message[item]);
        }
      }, (error) =>{
        this.toastMessage.error(error.error.error);
      })
    }
  }


  makeAdmin(ids:any){
    if( this.isAdmin === true){
      let payload ={
        'content':{
          'id': ids
        }
      }
      this.projectService.makePersonAdmin(payload).subscribe((result)=>{
        this.toastMessage.success(result.message);
      }, (error)=>{
        this.toastMessage.error(error.error.error)
      })
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
