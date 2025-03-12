import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../paginator/paginator.component';
import { ModalDocumentsComponent } from '../../daily/modal-documents/modal-documents.component';
import { ModalConfirmationComponent } from '../../../../modal/modal-confirmation/modal-confirmation.component';
import { Router } from '@angular/router';
import { CompanyService } from '../company.service';
import { ConfigService } from '../../../../services/config.service';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent, ModalDocumentsComponent],
  templateUrl: './company.component.html',
  styleUrl: './company.component.css'
})
export class CompanyComponent {

    @ViewChild(ModalConfirmationComponent) modal!: ModalConfirmationComponent;
    @ViewChild(ModalDocumentsComponent) modalDocuments!: ModalDocumentsComponent;


    documents:any[]=[]
    searchCodCompany: any = '';
    searchAddress: string = '';
    searchDocument: string='';      
    totalRegistros: number = 0;
    totalPages: number = 1;
    currentPage: number = 1;
    limit: number = 0;  
    dados:any    
    documentModalList:any[]=[]
    
    dailys:any[]=[]
    
    constructor(
      private router: Router, 
      private companyService: CompanyService,
      public configService:ConfigService
      
    ) {} 
        
  ngOnInit() {       
    this.limit=this.configService.limitPaginator;
      this.companyService.getAllCompanys(this.currentPage,this.limit).subscribe((response:any)=>{     
        console.log('response',response);
          this.dados=response.companys;  
          this.totalRegistros = response.total;
          this.totalPages = response.pages;
      });
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.searchCompany(this.currentPage);
  }
  
  searchCompany(currentPage:number) {    

    let objPesquisar: { 
      codCompany: string;     
      document: string; // Definindo o tipo correto para o array 'perfil'
      address:string;
      page:number;
      limit:number;
    }

    objPesquisar= { 
      codCompany: this.searchCodCompany, 
      address: this.searchAddress, 
      document: this.searchDocument ,      
      page:currentPage,
      limit:this.limit
    };

    console.log('DS',objPesquisar);

    this.companyService.searchCompany(objPesquisar).subscribe((response:any)=>{
      this.dados=response.companys;    
     
      this.totalRegistros = response.total;
      this.totalPages = response.pages;
    })

  }

  addCompany() {
    this.router.navigate(['/aplicacao/addCompany']);
  }

  updateCompany(id:string) {
    this.router.navigate(['/aplicacao/addCompany', id]);   
  }  

  async viewCompanyDocuments(item:any) { 

   if(item.Documents && item.Documents.length>0) {
      this.documentModalList=[];         

      item.Documents.forEach(async (element:any)=>{
        this.documentModalList.push({
                    cod:element.nameDocument, 
                    description:element.documentNumber
                  });   
      })

      const resultado = await this.modalDocuments.openModal(
        this.documentModalList,
       "Lista de documentos da empresa <br\><br\>" + item.Name,
        true); 

      if (resultado) {      
      } else {
        console.log("Usuário cancelou.");
      }
    }        
  }


  async viewCompanyPhones(item:any) { 

    if(item.Phone && item.Phone.length>0) {
       let PhoneModalList:any[]=[];         
 
       item.Phone.forEach(async (element:any)=>{
        PhoneModalList.push({
                     cod:this.configService.retornaCoutryName(element.codCountry)?.nameEN + ' - (' + element.codCountry + ')', 
                     description:(element.codState ? element.codState + ', ' : '') + element.phoneNumber
                   });   
       })
 
       const resultado = await this.modalDocuments.openModal(
        PhoneModalList,
        "Lista de telefones da empresa <br\><br\>" + item.Name,
         true); 
 
       if (resultado) {      
       } else {
         console.log("Usuário cancelou.");
       }
     }        
   }


   

  async viewCompanyExercises(item:any) { 

    if(item.Exercise  && item.Exercise.length>0) {
       let ExerciseModalList:any[]=[];         
 
       item.Exercise.forEach(async (element:any)=>{
        ExerciseModalList.push({
                     cod: element.year,
                     description:'Mês de início ' + element.startMonth + ' - Mês de fim ' + element.endMonth
                   });   
       })
 
       const resultado = await this.modalDocuments.openModal(
        ExerciseModalList,
        "Lista de anos de exercício da empresa <br\><br\>" + item.Name,
         true); 
 
       if (resultado) {      
       } else {
         console.log("Usuário cancelou.");
       }
     }        
   }
}
