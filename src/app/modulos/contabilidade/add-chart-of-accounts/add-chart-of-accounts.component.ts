import { Component, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { catchError, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


import { ActivatedRoute, Router } from '@angular/router';
import { ModalOkComponent } from '../../../modal/modal-ok/modal-ok.component';
import { ChartOfAccountService } from '../chart-of-accounts/chartOfAccount.service';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-add-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalOkComponent, FormsModule],
  templateUrl: './add-chart-of-accounts.component.html',
  styleUrl: './add-chart-of-accounts.component.css'
})
export class AddChartOfAccountsComponent {
  
  message=''
  isModalVisible = false;
  isEdit=false;
  idUser:string |null = null 
  formulario: FormGroup| null = null;
  years:number[]=[]
  currentYear: number = new Date().getFullYear();

  constructor(     
      private fb: FormBuilder,
      private coaService:ChartOfAccountService,
      private route: ActivatedRoute,
      private router: Router, 
      public configService:ConfigService
  ) {} 

  @ViewChild(ModalOkComponent) modal!: ModalOkComponent;

  validaYearSelecionado: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormArray) {
      const hasSelected = control.controls.some(ctrl => ctrl.get('ativo')?.value);     
      return hasSelected ? null :  { naoSelecionado: true };
    }
    return null;
  };
  
  
  get yearForm() {
    return (this.formulario?.get('year') as FormArray);
  }

  criarYear(value:number, ativo:boolean): FormGroup {
    return this.fb.group({  
      year: [value],
      value: [value],
      ativo:ativo
    });
  }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');  // Substitua 'id' pelo nome do parâmetro

      if(id) {
        this.isEdit=true;
        this.coaService.getChartOfAccountById(id??'0').subscribe((response)=>{       
          console.log('chartOfAccount',response);
          this.idUser=id;    
          this.createForm(response);     
          this.loadYear(response.Year)    
        })
      }
      else {
        this.isEdit=false;
        this. createForm({Active:true});       
        this.loadYear([])
      }
      

      console.log('this.formulario',this.formulario);
    });    
  }

  loadYear(years:[]) {    
    for(let year=2023;year<=this.currentYear+1;year++) {   

      const exist:boolean=years.filter((_year:number)=>year==_year)[0]
    
      this.yearForm.push(this.criarYear(year, exist?true:false));
    }   
  }


  handleConfirm() {   
    console.log('Confirmado!');
    this.isModalVisible = false;
  }
  
  requiredCheckboxValidator(formArray: FormArray): { [key: string]: boolean } | null {
    const selected = formArray.controls.some(control => control.value); // Verifica se algum checkbox foi marcado
    return selected ? null : { required: true };  // Se não, retorna erro
  }

  createForm(obj:any) {

        this.formulario = this.fb.group({
          active: [obj.Active, Validators.required],
          codAccount: [obj.CodAccount, Validators.required],
          description: [obj.Description, Validators.required],
          type: [!obj.Type? '' : obj.Type, Validators.required],        
          year: this.fb.array([], [Validators.required, this.validaYearSelecionado] )  // Array para perfis selecionados          
        }); 
    }

    
  async abrirModalConfirmacao(msgModal:string) {
    this.message=msgModal;
    const resultado = await this.modal.openModal(); 

    if (resultado) {
     
    } else {
      console.log("Usuário cancelou.");
    }
  }
  
  async openModalOk(_message:string) {
    this.message=_message
    this.isModalVisible = true;
  }

  gravar() {
   
    console.log('this.formulario',this.formulario);
    if (this.formulario?.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const formValues=this.formulario?.value;
    const objGravar: { 
      id?:string |null;
      codAccount: string;
      description: string;
      type: string;      
      active:boolean;
      year: number[]; // Definindo o tipo correto para o array 'perfil'    
      
    } ={
      id:null,
      codAccount:formValues.codAccount,
      description:formValues.description??'',
      type:formValues.type,   
      active:formValues.active,
      year:[],           
    }
   
   
    if(formValues.year && formValues.year.length) {       
      formValues.year.forEach((element:any) => {
        if(element.ativo)
        objGravar.year.push(element.value)  
      });              
    }   

    console.log('objGravar',objGravar);
    if(this.idUser) {

      objGravar.id=this.idUser
        this.coaService.updateChartOfAccounts(objGravar).pipe(
        tap(async (response:any) =>    {    
         this.message=response.message
         const resultado = await this.modal.openModal(); 
         if (resultado) {

         }

        }),
        catchError(async (error: HttpErrorResponse) => {
            
              if (error.status === 500) {
                console.log('Interceptando requisição:', error)
                this.message=error.message;
                const resultado = await this.modal.openModal(); 
                if (resultado) {

                }
                
              }

              if (error.status === 401) {
                  console.log('Interceptando requisição:', error.status)
                  // router.navigate(['/login']); // Redireciona para a página de login
              }
              return throwError(() => error);
          })
        
        ).subscribe(()=>{})
    }

    else {

      this.coaService.verifyExistsChartOfAccounts({codAccount:objGravar.codAccount}).subscribe((async (response:any)=>{
        if(response.message) {
            this.message="Essa conta já está cadastrada tente outra";
            const resultado = await this.modal.openModal(); 
            if (resultado) {

            }
        }
        else {
          this.coaService.addChartOfAccounts(objGravar).pipe(
            catchError((error: HttpErrorResponse) => {   
              if (error.status === 401) {
                console.log('Interceptando requisição:', error.status);
              }
              return throwError(() => error);
            })
          ).subscribe(async () => { 
            this.message = "Usuário cadastrado com sucesso";
          
            // Aguarda o resultado do modal antes de continuar
            const resultado = await this.modal.openModal(); 
          
            if (resultado) {
              console.log("Usuário confirmou!");
              // Insira aqui a lógica para continuar após a confirmação
            } else {
              console.log("Usuário cancelou.");
            }
          });
          
          }
      }))

   
     }       
  }
  
 
  cancel() {
    this.router.navigate(['/aplicacao/chartOfAccount']);
  }
}
