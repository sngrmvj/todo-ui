import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  submitFeedback(value:any){
    console.log(value.feedback);
    console.log("Need to get the email of the user to store that feedback");
    // We can use redis for saving the feedback
  }

}
