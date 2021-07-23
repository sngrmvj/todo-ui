import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'to-do-planner';

  constructor(){
    
  }

  ngOnInit(){
    this.calculateHits()
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
    }
  }


}
