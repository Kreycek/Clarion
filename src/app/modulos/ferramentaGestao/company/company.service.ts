import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../services/config.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
    // URL do seu backend para login

  constructor(
    private http: HttpClient,
    private configService:ConfigService
  ) {}

  getAllCompanys(page:number, limit:number): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/GetAllCompanys?page="+page + "&limit="+limit , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }
  


  getCompanyById(id:string): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/GetCompanyById?id="+id, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  addCompany(company:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/InsertCompany", company, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  updateCompany(company:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/UpdateCompany", company, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  verifyExistsCompany(company:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/VerifyExistCompany", company, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  searchCompany(company:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/SearchCompanys", company, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

 


}
