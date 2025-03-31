import { Component } from '@angular/core';


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../services/config.service';
import { ModalDocumentsComponent } from '../../ferramentaGestao/daily/modal-documents/modal-documents.component';
import { BalanceteService } from './balancete.service';


@Component({
  selector: 'app-balancete',
  imports: [ModalDocumentsComponent, CommonModule, FormsModule],
  templateUrl: './balancete.component.html',
  styleUrl: './balancete.component.css'
})
export class BalanceteComponent {

    searchStartMonth: any = '1';
    searchStartYear: any =  +new Date().getFullYear();  

    searchEndMonth: any = '3';
    searchEndYear: any =  +new Date().getFullYear();  
   
     constructor(
      public configService: ConfigService,
      public balanceteService:BalanceteService
      
    ) {}
  
    genetareReport() {
      
      const url = '/balanceteReport?initialYear='+this.searchStartYear + '&initialMonth=' + this.searchStartMonth + '&endYear=' + this.searchEndYear  + '&endMonth=' + this.searchEndMonth ;
      window.open(url, '_blank'); // Como está dentro de um evento de clique, não será bloqueado
   
    }

}
