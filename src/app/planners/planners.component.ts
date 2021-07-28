import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';

@Component({
  selector: 'app-planners',
  templateUrl: './planners.component.html',
  styleUrls: ['./planners.component.scss']
})
export class PlannersComponent implements OnInit {

  general_tasks:any = ['Tasks','Ready'];
  daily_tasks:any = ['Milk','Eggs','Tablets'];

  constructor() { }

  ngOnInit(): void {
  }

  delete(value:string,index:number){
    if (value === 'daily_tasks'){
      this.daily_tasks.splice(index,1);
      console.log(this.daily_tasks);
    }
    else{
      this.general_tasks.splice(index,1);
      console.log(this.general_tasks);
    }
  }

}
