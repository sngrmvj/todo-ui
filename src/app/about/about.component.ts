import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor( private toastMessage:ToastrService) { }

  ngOnInit(): void {
  }

  submitFeedback(value:any){
    if (value.feedback){
      // Need to get the email of the user to store that feedback
      // Send the token along with it as we can get the user id and from that we can retrieve the user details.
      // We can use redis for saving the feedback
      this.toastMessage.success("Thanks for the feedback !!");
    }
    else{
      this.toastMessage.warning("Please enter something to submit the feedback");
    }

  }

}
