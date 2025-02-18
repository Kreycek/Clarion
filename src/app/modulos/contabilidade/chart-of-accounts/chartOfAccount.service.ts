import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../services/config.service';

@Injectable({
  providedIn: 'root',
})
export class ChartOfAccountService {
    // URL do seu backend para login

  constructor(
    private http: HttpClient,
    private configService:ConfigService
  ) {}

  getChartOfAccounts(page:number, limit:number): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/getAllChartOfAccount?page="+page + "&limit="+limit , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }
  
  addChartOfAccounts(chartOfAccount:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/insertChartOfAccount", chartOfAccount, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  updateChartOfAccounts(chartOfAccount:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/updateChartOfAccount", chartOfAccount, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  verifyExistsChartOfAccounts(chartOfAccount:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/VerifyExistChartOfAccount", chartOfAccount, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  searchChartOfAccount(chartOfAccount:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/searchChartOfAccounts", chartOfAccount, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  getChartOfAccountById(id:string): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/getChartOfAccountById?id="+id, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }


  updateAllChartOfAccountWithNextYear(chartOfAccount:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/updateAllYearOfAccounts", chartOfAccount, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }
}
