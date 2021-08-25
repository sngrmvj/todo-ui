import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { CronJob } from 'cron';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../services/project-service';

@Component({
  selector: 'app-planners',
  templateUrl: './planners.component.html',
  styleUrls: ['./planners.component.scss']
})
export class PlannersComponent implements OnInit {

  displayDailyInput: boolean = false;
  displayGeneralInput: boolean = false;
  cronJob: CronJob;
  isDarkTheme: boolean = true; 
  shouldNotRefresh: boolean = true;

  general_tasks:any = ['Tasks','Ready'];
  generalTasksChecked: any = [];
  daily_tasks:any = ['Milk','Eggs'];
  dailyTasksChecked:any = [];

  constructor(private toastMessage:ToastrService, private router: Router, private projectService:ProjectService) {
    // For Every minute use all stars 
    // when the page refreshes it makes an api call So we need to have four lists stored per person
    // daily tasks, daily tasks checked, general tasks, general tasks checked.
    // It should be possible to delete even after checked.
    // Deletion of item in the daily tasks, daily tasks checked.
    // Need to handle the daily tasks, daily tasks checked during daily refresh.
    this.cronJob = new CronJob('0 0 * * * *', async () => {
      try {
        await this.refreshDailyTasks();
        this.shouldNotRefresh = false;
      } catch (e) {
        console.error(e);
        this.toastMessage.error("Error - "+ e);
      }
    });
    
    // Start job
    if (!this.cronJob.running) {
      this.cronJob.start();
    }

  }

  ngOnInit(): void {
    this.areYouAuthorized();
  }

  
  // ====================
  // Sign Out from the present one
  // ====================
  signOut(){
    localStorage.setItem('todo-loggedin','false');
    this.router.navigate(['authwall']);
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
    else{
      this.router.navigate(['authwall']);
    }

  }



  delete(value:string,index:number){
    if (value === 'daily_tasks'){
      let deleted_item = this.daily_tasks.splice(index,1);
      // Add the APi call to it
      this.toastMessage.success("Task deleted successfully!!");
    }
    else if(value === 'general_tasks'){
      let deleted_item = this.general_tasks.splice(index,1);
      // Add the APi call to it
      this.toastMessage.success("General task deleted successfully!!");
    }
    else if(value === 'dailyTasksChecked'){
      let deleted_item = this.dailyTasksChecked.splice(index,1);
      this.toastMessage.success("Daily task deleted successfully!!");
    }
    else if(value === 'generalTasksChecked'){
      let deleted_item = this.generalTasksChecked.splice(index,1);
      this.toastMessage.success("General task deleted successfully!!");
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
    this.toastMessage.success("Successfully added to daily tasks");
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
    this.toastMessage.success("Successfully added to general tasks");
  }

  closeGeneralInputTask(){
    if (this.displayGeneralInput === true){
      this.displayGeneralInput = false;
    }
  }


  // =======================
  // Adds the item to the checked ones list
  // =======================
  checked(value:any,index:any){
    if (value === 'daily_tasks'){
      let deleted_item = this.daily_tasks.splice(index,1);
      this.dailyTasksChecked.push(deleted_item);
      // NEED TO ADD THAT IN THE BACKEND API CALL
      this.toastMessage.success("Daily task checked successfully!!");
    }else{
      let deleted_item = this.general_tasks.splice(index,1);
      this.generalTasksChecked.push(deleted_item);
      // Need to add that in the backend API CALL
      this.toastMessage.success("General task checked successfully!!");
    }
  }

  // ===============================
  // If you click on this, This adds to the unchecked lists
  // ===============================
  unChecked(value:any,index:any){
    if (value === 'dailyTasksChecked'){
      let deleted_item = this.dailyTasksChecked.splice(index,1);
      this.daily_tasks.push(deleted_item);
      // NEED TO ADD THAT IN THE BACKEND API CALL
      this.toastMessage.success("Daily task unchecked successfully!!");
    }else{
      let deleted_item = this.generalTasksChecked.splice(index,1);
      this.general_tasks.push(deleted_item);
      // NEED TO ADD THAT IN THE BACKEND API CALL
      this.toastMessage.success("General task unchecked successfully!!");
    }
  }

}
