import { Injectable } from '@angular/core';




@Injectable({
  providedIn: 'root',
})
export class ConfigService {

    public apiUrl = 'http://localhost:8080'; 

    public  types=['R','I','M']
}