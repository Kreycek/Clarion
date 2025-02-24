import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../services/config.service';

@Injectable({
  providedIn: 'root',
})
export class CostCenterService {
    // URL do seu backend para login

  constructor(
    private http: HttpClient,
    private configService:ConfigService
  ) {}

  getAllCostCenter(page:number, limit:number): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/GetAllCostCenters?page="+page + "&limit="+limit , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

    //Carregar todos os diários sem documentos
    getAllOnlyCostCenter(): Observable<any> {
      return this.http.get(this.configService.apiUrl + "/GetAllOnlyCostCenters" , {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      });
    }
  

  getCostCenterById(id:string): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/GetCostCenerById?id="+id, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  addCostCenter(costCenter:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/InsertCostCenter", costCenter, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  updateCostCenter(costCenter:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/UpdateCostCenter", costCenter, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  verifyExistsCostCenter(costCenter:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/VerifyExistCostCenter", costCenter, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  searchCostCenter(daily:any): Observable<any> {
    return this.http.post(this.configService.apiUrl + "/SearchCostCenters", daily, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

 


}
