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

  constructor(private router: Router,private toastMessage:ToastrService, private projectService:ProjectService) { }

  ngOnInit(): void {
    this.areYouAuthorized()
  }

  // ====================
  // Need to check whether you are authorised or not
  // ====================
  areYouAuthorized(){
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
