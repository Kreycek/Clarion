import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { ModalConfirmationComponent } from '../../../../modal/modal-confirmation/modal-confirmation.component';
import { MovementService } from '../movement.service';
import { DailyService } from '../../../ferramentaGestao/daily/daily.service';
import { PaginatorComponent } from '../../../../paginator/paginator.component';
import { ModalDocumentsComponent } from '../../../ferramentaGestao/daily/modal-documents/modal-documents.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as _moment from 'moment';
import {default as _rollupMoment, Moment} from 'moment';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatDatepickerModule} from '@angular/material/datepicker';
// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-moviment',
  standalone: true,

  imports: [
    CommonModule, FormsModule,
    ModalDocumentsComponent,
    PaginatorComponent,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule
],
  templateUrl: './moviment.component.html',
  styleUrls: ['./moviment.component.css'],  // Corrigido para styleUrls
  
})
export class MovimentComponent {
  @ViewChild(ModalConfirmationComponent) modal!: ModalConfirmationComponent;
  @ViewChild(ModalDocumentsComponent) modalDocuments!: ModalDocumentsComponent;


  documents: any[] = [];
  searchCodDaily: any = '';
  searchMonth: any = '';
  searchYear: any =  +new Date().getFullYear();
  searchCodDocument: string = '';
  searchDocuments: any[] = [];
  totalRegistros: number = 0;
  totalPages: number = 1;
  currentPage: number = 1;
  limit: number = 0;
  currentYear: number = new Date().getFullYear();
  dados: any;
  documentModalList: any[] = [];
  dailys: any[] = [];
  

 
   constructor(
    private router: Router,
    private movementService: MovementService,
    public configService: ConfigService,
    private dailyService: DailyService
  ) {}

  ngOnInit() {

    this.limit=this.configService.limitPaginator;
    this.dailyService.getAllOnlyDaily().subscribe((response: any) => {
        this.dailys = response;   
          this.movementService.getAllMovement(this.currentPage, this.limit).subscribe((response: any) => {    
            this.dados = response.movements;
            this.prepareGridData(this.dados)            
            this.totalRegistros = response.total;
            this.totalPages = response.pages;        
          });
    });
  }

  filterComponents(codDaily: any) {
    let _documents = [];
    _documents = this.dailys.filter((response: any) => {
      return response.codDaily === codDaily;
    })[0];

    if (_documents) {
      this.documents = [];
      if (_documents.documents && _documents.documents.length > 0) {
        this.documents = [..._documents.documents];
        this.documents.unshift({
          codDocument: '',
          description: 'Todos',
          dtAdd: ''
        });
      } else {
        this.documents = [];
      }
    } else {
      this.documents = [];
    }
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.searchMovement(this.currentPage);
  }

  searchMovement(currentPage: number) {
    let objPesquisar: {
      codDaily: string;
      codDocument: string;  
      year:number,  
      month:number,        
      page: number;
      limit: number;
    };

    objPesquisar = {
      codDaily: this.searchCodDaily,
      codDocument: this.searchCodDocument,     
      year:+this.searchYear,
      month:+this.searchMonth,
      page: currentPage,
      limit: this.limit
    };


    this.movementService.searchMovement(objPesquisar).subscribe((response: any) => {
    
      this.dados = response.movements;
      this.prepareGridData( this.dados)    
      
      this.totalRegistros = response.total;
      this.totalPages = response.pages;
    });
  }

  addMovement() {
    this.router.navigate(['/aplicacao/addMovement']);
  }

  updateMovement(id: string) {
    this.router.navigate(['/aplicacao/addMovement', id]);
  }

  prepareGridData(dados:[]) {

    if(dados &&  dados.length>0) {

    

      dados.forEach((element:any) => {

        const dailyGrid=this.dailys.filter((dailyElement:any)=>{        
          return dailyElement.codDaily===element.CodDaily                   
        })[0];

        if(dailyGrid) {
          element.descriptionDaily=dailyGrid.description
          if(dailyGrid.documents &&   dailyGrid.documents.length>0) {
            const document=dailyGrid.documents.filter((document:any)=>{
              return document.codDocument==element.CodDocument
            })[0];
            element.descriptionDocument=document.description;
          }
         
        }
        else {
          element.descriptionDaily=''
          element.descriptionDocument=''
        }
      
    })
}

  }
}



