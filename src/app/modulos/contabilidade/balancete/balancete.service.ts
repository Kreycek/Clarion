import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ConfigService } from "../../../services/config.service";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class BalanceteService {
    // URL do seu backend para login

  constructor(
    private http: HttpClient,
    private configService:ConfigService
  ) {}

  getBalanceteReport(initialYear:number, initialMonth:number,endYear:number, endMonth:number): Observable<any> {
    return this.http.get(this.configService.apiUrl + "/GenerateBalanceteReport?initialYear="+initialYear + "&initialMonth="+initialMonth+ "&endYear="+endYear+ "&endMonth="+endMonth , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }
}