import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-planners',
  templateUrl: './planners.component.html',
  styleUrls: ['./planners.component.scss']
})
export class PlannersComponent implements OnInit {

  general_tasks:any = ['Tasks','Ready'];
  daily_tasks:any = ['Milk','Eggs'];

  constructor() { }

  ngOnInit(): void {
  }

  darkTheme(){
    //  Try to set the background color to one black color
  }

}
