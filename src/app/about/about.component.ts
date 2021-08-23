import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../services/project-service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor( private toastMessage:ToastrService, private projectService: ProjectService) { }

  ngOnInit(): void {
  }

  submitFeedback(value:any){
    if (value.feedback){
      let id_to_be_passed = window.atob(String(localStorage.getItem('todo-id')));
      let payload ={
        'content': {
          'id': id_to_be_passed,
          'feedback': value.feedback
        }
      }
      this.projectService.getTheFeedback(payload).subscribe((result)=>{
        this.toastMessage.success(result.message);
      }, (error)=>{
        if(error.status === 404 || error.status === 401){
          this.toastMessage.warning(error.error.message);
        }
        else{
          this.toastMessage.error(error.error.error);
        }
      })
      this.toastMessage.success("Thanks for the feedback !!");
    }
    else{
      this.toastMessage.warning("Please enter something to submit the feedback");
    }

  }

}
