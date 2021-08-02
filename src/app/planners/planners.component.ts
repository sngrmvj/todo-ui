import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { CronJob } from 'cron';
@Component({
  selector: 'app-planners',
  templateUrl: './planners.component.html',
  styleUrls: ['./planners.component.scss']
})
export class PlannersComponent implements OnInit {

  displayDailyInput: boolean = false;
  displayGeneralInput: boolean = false;
  cronJob: CronJob;
  general_tasks:any = ['Tasks','Ready'];
  daily_tasks:any = ['Milk','Eggs','Tablets'];

  constructor() {
    // For Every minute use all stars 
    this.cronJob = new CronJob('0 0 * * * *', async () => {
      try {
        await this.refreshDailyTasks();
      } catch (e) {
        console.error(e);
      }
    });
    
    // Start job
    if (!this.cronJob.running) {
      this.cronJob.start();
    }

  }

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

  async refreshDailyTasks() {
    // Need to have an API Call here so that it fetches from the backend and adds up here
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



  // =============
  // General Tasks 
  // =============

  showGeneralTaskInput(){
    if (this.displayGeneralInput === false){
      this.displayGeneralInput = true;
    }
  }

  addtoGeneral(value:any){
    this.general_tasks.push(value.taskItem);
    this.displayGeneralInput = false
  }

  closeGeneralInputTask(){
    if (this.displayGeneralInput === true){
      this.displayGeneralInput = false;
    }
  }

}
