import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalConfirmationComponent } from "../../../../modal/modal-confirmation/modal-confirmation.component";
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartOfAccountService } from '../chartOfAccount.service';
import { PaginatorComponent } from "../../../../paginator/paginator.component";
import { ConfigService } from '../../../../services/config.service';
import { ModalOkComponent } from "../../../../modal/modal-ok/modal-ok.component";

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [ModalConfirmationComponent, CommonModule, FormsModule, PaginatorComponent, ModalOkComponent],
  templateUrl: './chart-of-accounts.component.html',
  styleUrl: './chart-of-accounts.component.css'
})
export class ChartOfAccountsComponent {
  
  @ViewChild(ModalConfirmationComponent) modal!: ModalConfirmationComponent;
  @ViewChild(ModalOkComponent) modalOk!: ModalOkComponent;  
  @Input() viaPopup: boolean=false;
  
  @Output() dataForFatherpopUp: EventEmitter<any> = new EventEmitter();
  @Output() newAccountPopup: EventEmitter<any> = new EventEmitter();


  constructor(
    private router: Router, 
    private chartOfAccountService: ChartOfAccountService,
    public configService:ConfigService
    
  ) {}
    
  years:number[]=[]
  searchCodConta: string = '';
  searchDescricao: string = '';
  searchYear: [] = []
  searchType=''
  totalRegistros: number = 0;
  totalPages: number = 1;
  currentPage: number = 1;
  limit: number = 0;
  currentYear: number = new Date().getFullYear();
  filteredChartOfAccount = []; // Inicialmente, exibe todos os usuários  
  dados:any
  perfis:any
  isModalVisible = false;

  
  ngOnInit() {

    this.limit=this.configService.limitPaginator;
      for(let year=this.configService.years[0];year<=this.currentYear;year++) {
          this.years.push(year)
      }
      
      this.chartOfAccountService.getChartOfAccounts(this.currentPage,this.limit).subscribe((response:any)=>{     
          this.dados=response.chartOfAccounts;  
          this.totalRegistros = response.total;
          this.totalPages = response.pages;
      });
   }

  searchChartOfAccount(currentPage:number) {    

    let objPesquisar: { 
      codAccount: string;
      description: string;      
      year: number[]; // Definindo o tipo correto para o array 'perfil'
      type:string;
      page:number;
      limit:number;
    }

    objPesquisar= { 
      codAccount: this.searchCodConta, 
      description: this.searchDescricao, 
      year: +this.searchYear>0 ? [+this.searchYear] : [],
      type:this.searchType,
      page:currentPage,
      limit:this.limit
    };   

    this.chartOfAccountService.searchChartOfAccount(objPesquisar).subscribe((response:any)=>{
      this.dados=response.chartOfAccounts;    
      this.totalRegistros = response.total;
      this.totalPages = response.pages;
    })

  }

  addChartOfAccount() {
    if(!this.viaPopup) // Se não for do popup segue o código normal
      this.router.navigate(['/aplicacao/addChartOfAccount']);
    else {
      //Caso seja para cadastrar uma nova conta e venha do popup
      this.newAccountPopup.emit(true);
    }
  }

  updateChartOfAccount(id:string) {
    this.router.navigate(['/aplicacao/addChartOfAccount', id]);   
   } 
  
   onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.searchChartOfAccount(this.currentPage);
  }

  async updateAllChartOfAccountWithNextYear() {

    const resultado = await this.modal.openModal(true,"Deseja atualiar todas as contas para "+ (this.currentYear + 1));    

    if (resultado) {
      this.modal.isVisible=false;
      this.chartOfAccountService.updateAllChartOfAccountWithNextYear({year:this.currentYear+1}).subscribe();      

      const resultadook = await this.modalOk.openModal('Contas atualizadas com sucesso',true); 

      if (resultadook) { 

      }

    } else {
     
    }
 
  }

  selectAccount(accountObj:any) {
    this.dataForFatherpopUp.emit(accountObj);
  }

}
