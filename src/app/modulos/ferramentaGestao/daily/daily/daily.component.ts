import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOfAccountService } from '../../../contabilidade/chartOfAccount/chartOfAccount.service';
import { ConfigService } from '../../../../services/config.service';
import { ModalConfirmationComponent } from '../../../../modal/modal-confirmation/modal-confirmation.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../paginator/paginator.component';
import { ModalOkComponent } from '../../../../modal/modal-ok/modal-ok.component';
import { DailyService } from '../daily.service';
import { ModalDocumentsComponent } from "../modal-documents/modal-documents.component";

@Component({
  selector: 'app-daily',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent, ModalOkComponent, ModalConfirmationComponent, ModalDocumentsComponent],
  templateUrl: './daily.component.html',
  styleUrl: './daily.component.css'
})
export class DailyComponent { 
    
    @ViewChild(ModalConfirmationComponent) modal!: ModalConfirmationComponent;
    @ViewChild(ModalDocumentsComponent) modalDocuments!: ModalDocumentsComponent;

    documents:any[]=[]
    searchCodDaily: any = '';
    searchDescricao: string = '';
    searchDocuments: any[]=[];
    searchType=''
  
  
    totalRegistros: number = 0;
    totalPages: number = 1;
    currentPage: number = 1;
    limit: number = 2;
  
    currentYear: number = new Date().getFullYear();
    filteredChartOfAccount = []; // Inicialmente, exibe todos os usuários  
   
    messageOK=''
    dados:any
    perfis:any
    isModalVisible = false;

    isModalOkVisible = false;

    
    documentModalList:any[]=[]
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
      
      if(_documents.documents && _documents.documents.length>0)    {
       
         this.documents= [..._documents.documents];
        this.documents.unshift({
          "codDocument": "",
          "description": "Todos",
          "dtAdd": ""
        } )
      }
      else 
        this.documents=[]    
    }
    else {
      this.documents=[]
    }

    console.log('daily',this.documents);
  }
  

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.searchDaily(this.currentPage);
  }

  
  searchDaily(currentPage:number) {    

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

    console.log('objPesquisar',objPesquisar);

    this.dailyService.searchDaily(objPesquisar).subscribe((response:any)=>{
      this.dados=response.dailys;    
      this.totalRegistros = response.total;
      this.totalPages = response.pages;
    })

  }

  addDaily() {
    this.router.navigate(['/aplicacao/addDaily']);
  }

  updateDaily(id:string) {
    this.router.navigate(['/aplicacao/addDaily', id]);   
   } 
  
   async updateAllChartOfAccountWithNextYear() {

   
    const resultado = await this.modal.openModal(true,"Deseja atualiar todas as contas para "+ (this.currentYear + 1)); 

    if (resultado) {
      // this.chartOfAccountService.updateAllChartOfAccountWithNextYear({year:this.currentYear+1}).subscribe()
      this.isModalOkVisible=true;
      this.messageOK='Contas atualizadas com sucesso';
    } else {
      console.log("Usuário cancelou.");
    } 
  }

  async viewDailyDocuments(item:any) {
    console.log('list ',item);

   if(item.Documents && item.Documents.length>0) {
      this.documentModalList=[];         

      item.Documents.forEach(async (element:any)=>{
        this.documentModalList.push({
                    cod:element.codDocument, 
                    description:element.description
                  });   
      })

      const resultado = await this.modalDocuments.openModal(
        this.documentModalList,
       "Lista de documentos do diário <br\><br\>" + item.CodDaily + ' - ' + item.Description,
        true); 

      if (resultado) {      
      } else {
        console.log("Usuário cancelou.");
      }
    }        
  }
}
