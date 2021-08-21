import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../services/project-service';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.scss']
})
export class MyprofileComponent implements OnInit {


  isAdmin:boolean = false;
  allUserDetails: any = [];

  constructor(private router: Router,private toastMessage:ToastrService, private projectService:ProjectService) { }

  ngOnInit(): void {
    this.areYouAuthorized()
    this.getIsAdmin()
    this.allUsers()
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
      this.isAdmin = Boolean(window.atob(value));
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
  deleteUser(user:any){
    if(this.isAdmin === true){
      console.log(user)
    }
  }



}
