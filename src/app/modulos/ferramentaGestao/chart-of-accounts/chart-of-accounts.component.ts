import { Component } from '@angular/core';
import { ModalConfirmationComponent } from "../../../modal/modal-confirmation/modal-confirmation.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartOfAccountService } from './chartOfAccount.service';
import { PaginatorComponent } from "../../../paginator/paginator.component";

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [ModalConfirmationComponent, CommonModule, FormsModule, PaginatorComponent],
  templateUrl: './chart-of-accounts.component.html',
  styleUrl: './chart-of-accounts.component.css'
})
export class ChartOfAccountsComponent {

  constructor(
    private router: Router, 
    private chartOfAccountService: ChartOfAccountService,
    
  ) {}

  types=['R','I','M']
  years:number[]=[]
  searchCodConta: string = '';
  searchDescricao: string = '';
  searchYear: [] = []
  totalRegistros: number = 0;
  totalPages: number = 1;
  currentPage: number = 1;
  limit: number = 50;
  searchType=''
  currentYear: number = new Date().getFullYear();

  filteredChartOfAccount = []; // Inicialmente, exibe todos os usuários
  
  
  ngOnInit() {


    for(let ano=2023;ano<=this.currentYear;ano++) {
        this.years.push(ano)
    }
    
      this.chartOfAccountService.getChartOfAccounts(this.currentPage,this.limit).subscribe((response:any)=>{
          console.log('users',response);
          this.dados=response.chartOfAccounts;  
          this.totalRegistros = response.total;
          this.totalPages = response.pages;
      })
   }

  searchChartOfAccount(currentPage:number) {

    console.log('searchYear',this.searchYear);

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
      year: this.searchYear,
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
 
  dados:any
  perfis:any
  isModalVisible = false;

  openModal() {
    this.isModalVisible = true;
  }

  handleConfirm() {   
    console.log('Confirmado!');
    this.isModalVisible = false;
  }

  handleCancel() {    
    this.isModalVisible = false;
  }

  teste($event:any) {
    console.log('$event',$event);
  }

  addChartOfAccount() {
    this.router.navigate(['/aplicacao/addUser']);
  }

   updateChartOfAccount(id:string) {
    this.router.navigate(['/aplicacao/addUser', id]);   
   } 
  
   onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.searchChartOfAccount(this.currentPage);
  }
}
