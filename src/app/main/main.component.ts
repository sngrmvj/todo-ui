import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private router: Router) { }


  isTokenValid: boolean = false

  ngOnInit(): void {
  }

  checkTokenValidity(){
    return false
  }

  goTo(){

    this.isTokenValid = this.checkTokenValidity()

    if (this.isTokenValid === false){
      this.router.navigate(['authwall'])
    }
    else{
      this.router.navigate(['planners'])
    }

  }

}
