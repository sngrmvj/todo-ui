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
    check_authorizationURL: string = UrlService.check_authorization
    get_access_token_url:string = UrlService.getAccessTokenURL
    makeAdminURL: string = UrlService.make_adminURL
    getAllURL: string = UrlService.getAllURL
    get_user_url:string = UrlService.getUserURL


    // Auth Functions   
    getUrl(){
        if (location.origin.includes("localhost")){
            return "http://localhost:8000"
        }
        return 
    }


    checksAuthorization():Observable<any>{
        let URL = this.getUrl();
        return this.http.get<any>(URL+this.check_authorizationURL, {withCredentials: true,responseType:'json' as 'json'});
    }

    register(data:any): Observable<any>{
        let URL = this.getUrl()
        return this.http.post<any>(URL+this.registerURL,data);
    }

    login(data:any): Observable<any>{
        let URL = this.getUrl()
        return this.http.put<any>(URL+this.loginURL,data, {withCredentials: true, observe:"response"});
    }

    getAccessToken():Observable<any>{
        let URL = this.getUrl()
        return this.http.get<any>(URL+this.get_access_token_url,{withCredentials: true,responseType:'json' as 'json'});
    }

    makePersonAdmin(data:any): Observable<any>{
        let URL = this.getUrl()
        return this.http.put<any>(URL+this.makeAdminURL,data,{withCredentials: true,responseType:'json' as 'json'});
    }

    getAllDetails():Observable<any>{
        let URL = this.getUrl();
        return this.http.get<any>(URL+this.getAllURL,{withCredentials: true,responseType:'json' as 'json'}); 
    }

    getUser(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.get<any>(URL+this.get_user_url+"?id="+data,{withCredentials: true,responseType:'json' as 'json'}); 
    }

}


