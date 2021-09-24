import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { ProjectService } from './services/project-service';
import { ToastrService } from 'ngx-toastr';
import { catchError, tap } from "rxjs/operators";
import { of, throwError, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'to-do-planner';

  constructor(private http: HttpClient,private router: Router,private toastMessage:ToastrService, private projectService: ProjectService){
    
  }

  ngOnInit(){
    this.calculateHits()
    this.pingBackend()
  }


  pingBackend(){
    this.projectService.pingServer().subscribe((result)=>{
      console.info(result.status);
      this.toastMessage.success(result.status);
    }, (error)=>{
      this.toastMessage.warning("Error in contacting the server");
      this.toastMessage.warning("Please contact the admin");
      this.router.navigate(['authwall']);
    })
  }  

  calculateHits(){
    var n = localStorage.getItem('hitCounter');
    if (n === null) {
      n = '0'
      var hitCount = Number(n).valueOf();
      console.log(hitCount)
    }
    else{
      var hitCount = Number(n).valueOf();
      hitCount++;
      n = hitCount.toString();
    }

    localStorage.setItem("hitCounter", n);


    var hitCount = Number(n).valueOf();
    if ((hitCount % 50) == 0){
      // Collect IP Address and send that to authentication server
      this.http.get<any>('https://geolocation-db.com/json/')
      .pipe(
        catchError(err => {
          return throwError(err);
        }),
        tap(response => {
          console.log(response.IPv4);
        })
      )
    }
  }





}
