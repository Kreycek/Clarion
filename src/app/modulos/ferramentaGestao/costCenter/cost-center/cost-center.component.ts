
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { ModalConfirmationComponent } from '../../../../modal/modal-confirmation/modal-confirmation.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../paginator/paginator.component';
import { ModalDocumentsComponent } from '../../daily/modal-documents/modal-documents.component';
import { CostCenterService } from '../costCenter.service';


@Component({
  selector: 'app-cost-center',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent, ModalDocumentsComponent],
  templateUrl: './cost-center.component.html',
  styleUrl: './cost-center.component.css'
})
export class CostCenterComponent {

    @ViewChild(ModalConfirmationComponent) modal!: ModalConfirmationComponent;
    @ViewChild(ModalDocumentsComponent) modalDocuments!: ModalDocumentsComponent;


    searchCodCostCenter: any = '';
    searchDescricao: string = '';
    searchCostCenterSub: any[]=[];  
    totalRegistros: number = 0;
    totalPages: number = 1;
    currentPage: number = 1;
    limit: number = this.configService.limitPaginator;  
    currentYear: number = new Date().getFullYear();
    dados:any
    costCenterSubModalList:any[]=[]
    costCenters:any[]=[]    
    costCentersSub:any[]=[]

    constructor(
      private router: Router, 
      private costCenterService: CostCenterService,
      public configService:ConfigService
      
    ) {} 
    

    ngOnInit() {
 
      this.costCenterService.getAllOnlyCostCenter().subscribe((response:any)=>{     
        this.costCenters=response;
        console.log('getAllOnlyDaily',response);

      })   

       
      this.costCenterService.getAllCostCenter(this.currentPage,this.limit).subscribe((response:any)=>{     
        console.log('response',response);
          this.dados=response.costCenters;  
          this.totalRegistros = response.total;
          this.totalPages = response.pages;
      });
   }

  filterCostCenterSub(codCostCenter:any) {

    let _costCenters=[]
    _costCenters=this.costCenters.filter((response:any)=>{
      return response.codCostCenter===codCostCenter

    } )[0]

    if(_costCenters) {
      this.costCentersSub=[];
      
      if(_costCenters.costCenterSub && _costCenters.costCenterSub.length>0)    {
       
        this.costCentersSub= [..._costCenters.costCenterSub];
        this.costCentersSub.unshift({
          "codCostCenterSub": "",
          "description": "Todos",
          "dtAdd": ""
        } )
      }
      else 
        this.costCentersSub=[]    
    }
    else {
      this.costCentersSub=[]
    }
  }
  

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.searchCostCenters(this.currentPage);
  }

  
  searchCostCenters(currentPage:number) {    

    let objPesquisar: { 
      codCostCenter: string;
      description: string;      
      codCostCenterSub: any[]; // Definindo o tipo correto para o array 'perfil'
    
      page:number;
      limit:number;
    }

    objPesquisar= { 
      codCostCenter: this.searchCodCostCenter, 
      description: this.searchDescricao, 
      codCostCenterSub: this.searchCostCenterSub,      
      page:currentPage,
      limit:this.limit
    };

    console.log('objPesquisar',objPesquisar);

    this.costCenterService.searchCostCenter(objPesquisar).subscribe((response:any)=>{
      this.dados=response.costCenters;    
      this.totalRegistros = response.total;
      this.totalPages = response.pages;
    })

  }

  addCostCenter() {
    this.router.navigate(['/aplicacao/addCostCenter']);
  }

  updateCostCenter(id:string) {
    this.router.navigate(['/aplicacao/addCostCenter', id]);   
   } 
  

  async viewSubCostCenter(item:any) {
    console.log('list ',item);

   if(item.CostCenterSub    && item.CostCenterSub.length>0) {
      this.costCenterSubModalList=[];         

      item.CostCenterSub.forEach(async (element:any)=>{
        this.costCenterSubModalList.push({
                    cod:element.codCostCenterSub, 
                    description:element.description
                  });   
      })

      const resultado = await this.modalDocuments.openModal(
        this.costCenterSubModalList,
       "Lista de centro de sub custo do centro de custo do centro de custo <br\><br\>" + item.CodCostCenter + ' - ' + item.Description,
        true); 

      if (resultado) {      
      } else {
        console.log("Usuário cancelou.");
      }
    }        
  }
}
