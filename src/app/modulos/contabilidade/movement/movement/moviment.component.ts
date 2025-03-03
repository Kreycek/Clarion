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


@Component({
  selector: 'app-moviment',
  standalone: true,

  imports: [
    CommonModule, FormsModule,
    ModalDocumentsComponent,
    PaginatorComponent,
   
    
  
],
  templateUrl: './moviment.component.html',
  styleUrls: ['./moviment.component.css'],  // Corrigido para styleUrls
  
})
export class MovimentComponent {
  @ViewChild(ModalConfirmationComponent) modal!: ModalConfirmationComponent;
  @ViewChild(ModalDocumentsComponent) modalDocuments!: ModalDocumentsComponent;

  documents: any[] = [];
  searchCodDaily: any = '';
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
      console.log('getAllOnlyDaily', response);
    });

    this.movementService.getAllMovement(this.currentPage, this.limit).subscribe((response: any) => {
      this.dados = response.movements;
      this.totalRegistros = response.total;
      this.totalPages = response.pages;
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
      page: number;
      limit: number;
    };

    objPesquisar = {
      codDaily: this.searchCodDaily,
      codDocument: this.searchCodDocument,     
     
      page: currentPage,
      limit: this.limit
    };

    console.log('objPesquisar', objPesquisar);

    this.movementService.searchMovement(objPesquisar).subscribe((response: any) => {
      this.dados = response.dailys;
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
}
