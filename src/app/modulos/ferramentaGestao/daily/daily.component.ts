import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOfAccountService } from '../../contabilidade/chart-of-accounts/chartOfAccount.service';
import { ConfigService } from '../../../services/config.service';
import { ModalConfirmationComponent } from '../../../modal/modal-confirmation/modal-confirmation.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../paginator/paginator.component';
import { ModalOkComponent } from '../../../modal/modal-ok/modal-ok.component';
import { DailyService } from './daily.service';

@Component({
  selector: 'app-daily',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent, ModalOkComponent, ModalConfirmationComponent],
  templateUrl: './daily.component.html',
  styleUrl: './daily.component.css'
})
export class DailyComponent { 
    
    @ViewChild(ModalConfirmationComponent) modal!: ModalConfirmationComponent;

    documents:any[]=[]
    searchCodDaily: any = '';
    searchDescricao: string = '';
    searchDocuments: any;
    searchType=''
  
  
    totalRegistros: number = 0;
    totalPages: number = 1;
    currentPage: number = 1;
    limit: number = 50;
  
    currentYear: number = new Date().getFullYear();
    filteredChartOfAccount = []; // Inicialmente, exibe todos os usuários  
    messageModal='';
    messageOK=''
    dados:any
    perfis:any
    isModalVisible = false;
    isModalOkVisible = false;

    dailys:any[]=[]
    
    

    constructor(
      private router: Router, 
      private dailyService: DailyService,
      public configService:ConfigService
      
    ) {} 
    

    ngOnInit() {
 
      this.dailyService.getAllOnlyDaily().subscribe((response:any)=>{     
        this.dailys=response;
        console.log('getAllOnlyDaily',response);

      })

      
      this.dailyService.getAllDaily(this.currentPage,this.limit).subscribe((response:any)=>{     
        console.log('response',response);
          this.dados=response.dailys;  
          this.totalRegistros = response.total;
          this.totalPages = response.pages;
      });
   }

  filterComponents(codDaily:any) {

    let _documents=[]
    _documents=this.dailys.filter((response:any)=>{
      return response.codDaily===codDaily

    } )[0]

    if(_documents) {
      this.documents=[];
      console.log('dailyAAA',_documents);
      if(_documents.documents && _documents.documents.length>0)    {
        _documents.documents=[];
        _documents.documents.unshift({
          "codDocument": "",
          "description": "Todos",
          "dtAdd": ""
        } )

        this.documents= [..._documents.documents];
      }
      else 
        this.documents=[]
    
    }
    else {
      this.documents=[]
    }

    console.log('daily',this.documents);
  }


  handleOkCancel() {    
    this.isModalOkVisible = false;
  }

  handleConfirm() {      
    this.isModalVisible = false;
  }
  
  handleCancel() {    
    this.isModalVisible = false;
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.searchChartOfAccount(this.currentPage);
  }

  
  searchChartOfAccount(currentPage:number) {    

    let objPesquisar: { 
      codDaily: string;
      description: string;      
      documents: any[]; // Definindo o tipo correto para o array 'perfil'
    
      page:number;
      limit:number;
    }

    objPesquisar= { 
      codDaily: this.searchCodDaily, 
      description: this.searchDescricao, 
      documents: this.searchDocuments,      
      page:currentPage,
      limit:this.limit
    };   

    // this.chartOfAccountService.searchChartOfAccount(objPesquisar).subscribe((response:any)=>{
    //   this.dados=response.chartOfAccounts;    
    //   this.totalRegistros = response.total;
    //   this.totalPages = response.pages;
    // })

  }

  addChartOfAccount() {
    this.router.navigate(['/aplicacao/addChartOfAccount']);
  }

  updateChartOfAccount(id:string) {
    this.router.navigate(['/aplicacao/addChartOfAccount', id]);   
   } 
  
   async updateAllChartOfAccountWithNextYear() {

    this.messageModal="Deseja atualiar todas as contas para "+ (this.currentYear + 1);
    const resultado = await this.modal.openModal(); 

    if (resultado) {
      // this.chartOfAccountService.updateAllChartOfAccountWithNextYear({year:this.currentYear+1}).subscribe()
      this.isModalOkVisible=true;
      this.messageOK='Contas atualizadas com sucesso';
    } else {
      console.log("Usuário cancelou.");
    }
 
  }

}
