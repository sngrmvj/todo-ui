import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';

@Component({
  selector: 'app-planners',
  templateUrl: './planners.component.html',
  styleUrls: ['./planners.component.scss']
})
export class PlannersComponent implements OnInit {

  displayDailyInput: boolean = false;
  general_tasks:any = ['Tasks','Ready'];
  daily_tasks:any = ['Milk','Eggs','Tablets'];

  constructor() { }

  ngOnInit(): void {
  }

  delete(value:string,index:number){
    if (value === 'daily_tasks'){
      let deleted_item = this.daily_tasks.splice(index,1);
      // Add the APi call to it
    }
    else{
      this.general_tasks.splice(index,1);
      console.log(this.general_tasks);
    }
  }






  // =============
  // Daily Tasks 
  // =============
  showDailyTaskInput(){
    if (this.displayDailyInput === false){
      this.displayDailyInput = true;
    }
  }

  closeDailyInputTask(){
    if (this.displayDailyInput === true){
      this.displayDailyInput = false;
    }
  }

  addtoDaily(value:any){
    this.daily_tasks.push(value.taskItem);
    this.displayDailyInput = false
  }

}
