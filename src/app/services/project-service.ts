import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UrlService } from './url-service';

@Injectable()
export class ProjectService {
    constructor(private http: HttpClient) { }

    registerURL: string = UrlService.registerURL
    loginURL: string = UrlService.loginURL


    // Auth Functions   
    getUrl(){
        if (location.origin.includes("localhost")){
            return "http://localhost:8000"
        }
        return 
    }


    register(data:any): Observable<any>{
        let URL = this.getUrl()
        return this.http.post<any>(URL+this.registerURL,data);
    }

    login(data:any): Observable<any>{
        let URL = this.getUrl()
        return this.http.put<any>(URL+this.loginURL,data, {observe: 'response'});
    }


}


