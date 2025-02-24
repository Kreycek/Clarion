import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../services/config.service';

@Injectable({
  providedIn: 'root',
})
export class MovementService {
    // URL do seu backend para login

  constructor(
    private http: HttpClient,
    private configService:ConfigService
  ) {}

  getAllMovement(page:number, limit:number): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/GetAllMovements?page="+page + "&limit="+limit , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }
  

  getMovementById(id:string): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/GetMovementById?id="+id, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  addMovement(daily:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/InsertMovement", daily, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  updateMovement(daily:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/UpdateMovement", daily, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  verifyExistsMovement(daily:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/VerifyExistMovement", daily, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  searchMovement(daily:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/SearchMovements", daily, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

 


}
