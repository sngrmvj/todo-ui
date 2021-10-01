import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ObservedValueOf, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UrlService } from './url-service';

@Injectable()
export class ProjectService {
    constructor(private http: HttpClient) { }

    migrationURL: string = UrlService.migrationURl
    pingURL: string= UrlService.pingURL
    registerURL: string = UrlService.registerURL
    loginURL: string = UrlService.loginURL
    check_authorizationURL: string = UrlService.check_authorization
    get_access_token_url:string = UrlService.getAccessTokenURL
    makeAdminURL: string = UrlService.make_adminURL
    getAllURL: string = UrlService.getAllURL
    get_user_url:string = UrlService.getUserURL
    update_email:string = UrlService.updateEmailURL
    update_lastname:string = UrlService.updatelastnameURL
    update_firstname:string = UrlService.updatefirstnameURL
    password_profile:string = UrlService.passwordResetFromProfileURl
    forgotPasswordURL: string = UrlService.forgotPasswordURL
    blacklistURL: string = UrlService.blacklistTokenURL
    deleteURLS: any = {
        'account_deletion' : UrlService.accountDeleteURL,
        'deleteUser': UrlService.deleteUserURL
    }
    OTPs: any ={
        'send_otp': UrlService.sendOtpURL,
        'validate_otp': UrlService.validateOTPURL
    }
    feedbacks: any  = {
        'storeFeedback': UrlService.feedbackURL,
        'displayFeedback': UrlService.displayFeedbackURL
    }

    tasksEndpoints:any = {
        'post_general_tasks': UrlService.post_tasks_general_url,
        'get_tasks_general_url': UrlService.get_tasks_general_url,
        'toggle_the_general_tasks_url' : UrlService.toggle_general_url,
        'delete_the_general_tasks_url' : UrlService.deleted_general_url,

        'post_daily_tasks': UrlService.post_tasks_daily_url,
        'get_tasks_daily_url': UrlService.get_tasks_daily_url,
        'toggle_the_daily_tasks_url' : UrlService.toggle_daily_url,
        'delete_the_daily_tasks_url' : UrlService.deleted_daily_url,
        'fetch_refreshed_daily_tasks_url' : UrlService.fetch_refreshed_daily_tasks_url,
    }



    // Auth Functions   
    getUrl(){
        if (location.origin.includes("localhost")){
            return "http://localhost:8000"
        }
        return 
    }

    tasksUrl(){
        if(location.origin.includes("localhost")){
            return "http://localhost:5000"
        }
        return
    }


    // Ping
    pingServer():Observable<any>{
        let URL = this.getUrl()
        return this.http.get<any>(URL+this.pingURL)
    }

    //Migration
    migrate():Observable<any>{
        let URL = this.getUrl()
        return this.http.put<any>(URL+this.migrationURL,{})
    }


    // Authentication Section
    register(data:any): Observable<any>{
        let URL = this.getUrl()
        return this.http.post<any>(URL+this.registerURL,data);
    }

    login(data:any): Observable<any>{
        let URL = this.getUrl()
        return this.http.put<any>(URL+this.loginURL,data, {withCredentials: true, observe:"response"});
    }

    checksAuthorization():Observable<any>{
        let URL = this.getUrl();
        return this.http.get<any>(URL+this.check_authorizationURL, {withCredentials: true,responseType:'json' as 'json'});
    }

    getAccessToken():Observable<any>{
        let URL = this.getUrl()
        return this.http.get<any>(URL+this.get_access_token_url,{withCredentials: true,responseType:'json' as 'json'});
    }


    // Get Details Section
    getAllDetails():Observable<any>{
        let URL = this.getUrl();
        return this.http.get<any>(URL+this.getAllURL,{withCredentials: true,responseType:'json' as 'json'}); 
    }

    getUser(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.get<any>(URL+this.get_user_url+"?id="+data,{withCredentials: true,responseType:'json' as 'json'}); 
    }


    // Update Section
    updateUserEmail(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.put<any>(URL+this.update_email,data,{withCredentials: true,responseType:'json' as 'json'})
    }

    updateUserlastname(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.put<any>(URL+this.update_lastname,data,{withCredentials: true,responseType:'json' as 'json'})
    }

    updateUserfirstname(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.put<any>(URL+this.update_firstname,data,{withCredentials: true,responseType:'json' as 'json'})
    }

    updatePasswordProfile(data:any): Observable<any>{
        let URL = this.getUrl();
        return this.http.put<any>(URL+this.password_profile,data,{withCredentials: true,responseType:'json' as 'json'})
    }


    // Forgot Section
    forgotPassword(data:any):Observable<any>{
        let URL = this.getUrl()
        return this.http.post<any>(URL+this.forgotPasswordURL,data,{withCredentials: true,responseType:'json' as 'json'});
    }


    // Deletion Section
    deleteUser(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.delete<any>(URL+this.deleteURLS.deleteUser+"?id="+data,{withCredentials: true,responseType:'json' as 'json'})
    }

    accountDeletion(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.delete<any>(URL+this.deleteURLS.account_deletion+"?id="+data,{withCredentials: true,responseType:'json' as 'json'})
    }


    // OTP section
    emailOTP(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.put<any>(URL+this.OTPs.send_otp,data,{withCredentials: true,responseType:'json' as 'json'}) 
    }

    validateSentOTP(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.put<any>(URL+this.OTPs.validate_otp,data,{withCredentials: true,responseType:'json' as 'json'}) 
    }


    // General Section
    makePersonAdmin(data:any): Observable<any>{
        let URL = this.getUrl();
        return this.http.put<any>(URL+this.makeAdminURL,data,{withCredentials: true,responseType:'json' as 'json'});
    }

    blacklistRefreshToknen(): Observable<any>{
        let URL = this.getUrl();
        return this.http.get<any>(URL+this.blacklistURL,{withCredentials: true,responseType:'json' as 'json'})
    }



    // Feedback Section
    getTheFeedback(data:any):Observable<any>{
        let URL = this.getUrl();
        return this.http.put<any>(URL+this.feedbacks.storeFeedback,data,{withCredentials: true,responseType:'json' as 'json'});
    }

    getAllFeedback(): Observable<any>{
        let URL = this.getUrl();
        return this.http.get<any>(URL+this.feedbacks.displayFeedback,{withCredentials: true,responseType:'json' as 'json'})
    }











    // Tasks
    postGeneralTasks(payload:any,heads:any):Observable<any>{
        let URL = this.tasksUrl();
        return this.http.post<any>(URL+this.tasksEndpoints.post_general_tasks,payload,{withCredentials: true,responseType:'json' as 'json',headers:heads})
    }

    getGeneralTasks(heads:any):Observable<any>{
        let URL = this.tasksUrl();
        return this.http.get<any>(URL+this.tasksEndpoints.get_tasks_general_url,{withCredentials: true,responseType:'json' as 'json',headers:heads})  
    }

    toggleGeneralTasks(payload:any,heads:any):Observable<any>{
        let URL = this.tasksUrl();
        return this.http.put<any>(URL+this.tasksEndpoints.toggle_the_general_tasks_url,payload,{withCredentials: true,responseType:'json' as 'json',headers:heads})
    }

    deleteGeneralTasksAPI(payload:any,heads:any,category:any):Observable<any>{
        let URL = this.tasksUrl();
        return this.http.put<any>(URL+this.tasksEndpoints.delete_the_general_tasks_url+"?category="+category,payload,{withCredentials: true,responseType:'json' as 'json',headers:heads})
    }



    // Daily Tasks
    postDailyTasks(payload:any,heads:any):Observable<any>{
        let URL = this.tasksUrl();
        return this.http.post<any>(URL+this.tasksEndpoints.post_daily_tasks,payload,{withCredentials: true,responseType:'json' as 'json',headers:heads})
    }

    getDailyTasks(heads:any):Observable<any>{
        let URL = this.tasksUrl();
        return this.http.get<any>(URL+this.tasksEndpoints.get_tasks_daily_url,{withCredentials: true,responseType:'json' as 'json',headers:heads})  
    }

    refreshDailyTasksAPI(heads:any):Observable<any>{
        let URL = this.tasksUrl();
        return this.http.get<any>(URL+this.tasksEndpoints.fetch_refreshed_daily_tasks_url,{withCredentials: true,responseType:'json' as 'json',headers:heads})  
    }

    toggleDailyTasks(payload:any,heads:any):Observable<any>{
        let URL = this.tasksUrl();
        return this.http.put<any>(URL+this.tasksEndpoints.toggle_the_daily_tasks_url,payload,{withCredentials: true,responseType:'json' as 'json',headers:heads})
    }

    deleteDailyTasksAPI(payload:any,heads:any,category:any):Observable<any>{
        let URL = this.tasksUrl();
        return this.http.put<any>(URL+this.tasksEndpoints.delete_the_daily_tasks_url+"?category="+category,payload,{withCredentials: true,responseType:'json' as 'json',headers:heads})
    }

}


