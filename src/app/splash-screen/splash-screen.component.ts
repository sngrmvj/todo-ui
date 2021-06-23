import { Component, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  animations:[]
})
export class SplashScreenComponent implements OnInit {

  constructor(private router: Router) { }

  windowWidth: string = "";
  showSplash = true;

  ngOnInit(): void {
    setTimeout(() => {
      this.windowWidth = "-" + window.innerWidth + "px";

      setTimeout(() => {
        this.showSplash = !this.showSplash;
        this.router.navigate(['to-do'])
      }, 500);
    }, 4000);

    
  }

}
