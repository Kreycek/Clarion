import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../services/config.service';

@Injectable({
  providedIn: 'root',
})
export class DailyService {
    // URL do seu backend para login

  constructor(
    private http: HttpClient,
    private configService:ConfigService
  ) {}

  getAllDaily(page:number, limit:number): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/getAllDailys?page="+page + "&limit="+limit , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }
  
  //Carregar todos os diários sem documentos
  getAllOnlyDaily(): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/getAllOnlyDailys" , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

   //Carregar todos os diários sem documentos
   getAllOnlyDailyActive(): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/GetAllOnlyDailyActive" , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  getDailyById(id:string): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/getDailyById?id="+id, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  addDaily(daily:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/InsertDaily", daily, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  updateDaily(daily:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/UpdateDaily", daily, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  verifyExistsDaily(daily:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/VerifyExistDaily", daily, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  searchDaily(daily:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/SearchDailys", daily, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

 


}
