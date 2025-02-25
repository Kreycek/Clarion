import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl,FormControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';import { catchError, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalOkComponent } from '../../../../modal/modal-ok/modal-ok.component';
import { ChartOfAccountService } from '../chartOfAccount.service';
import { ConfigService } from '../../../../services/config.service';
import { CostCenterService } from '../../../ferramentaGestao/costCenter/costCenter.service';

@Component({
  selector: 'app-add-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalOkComponent, FormsModule],
  templateUrl: './add-chart-of-accounts.component.html',
  styleUrl: './add-chart-of-accounts.component.css'
})
export class AddChartOfAccountsComponent {
  
  isEdit=false;
  idUser:string |null = null 
  formulario: FormGroup| null = null;
  years:number[]=[]
  currentYear: number = new Date().getFullYear();
  costCenters:any[]=[]    
  costCentersSub:any[]=[]
  listCostCenters:any[]=[];

  constructor(     
      private fb: FormBuilder,
      private coaService:ChartOfAccountService,
      private route: ActivatedRoute,
      private router: Router, 
      public configService:ConfigService,
      private costCenterService: CostCenterService,
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

    this.costCenterService.getAllOnlyCostCenter().subscribe((response:any)=>{     
      this.costCenters=response;

      console.log('costCenters',this.costCenters);
     
    })   

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
      
    });    
  }

  loadYear(years:[]) {    
    for(let year=2023;year<=this.currentYear+1;year++) {   
      const exist:boolean=years.filter((_year:number)=>year==_year)[0]    
      this.yearForm.push(this.criarYear(year, exist?true:false));
    }   
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
          year: this.fb.array([], [Validators.required, this.validaYearSelecionado] ),  // Array para perfis selecionados          
          FormNewCostCenter: new FormGroup({  // Subformulário dentro do formulário principal
                  codCostCenter:new FormControl('',[Validators.required]),
                  codCostCenterName:new FormControl(''),
                  codCostCenterSub: new FormControl('',[Validators.required]),
                  codCostCenterSubName: new FormControl('')
                })
        }); 
  }

  async abrirModalConfirmacao(msgModal:string) {
  
    const resultado = await this.modal.openModal(msgModal,true); 

    if (resultado) {
     
    } else {
      console.log("Usuário cancelou.");
    }
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
        
         const resultado = await this.modal.openModal(response.message,true); 
         if (resultado) {

         }
        }),
        catchError(async (error: HttpErrorResponse) => {
            
              if (error.status === 500) {
                console.log('Interceptando requisição:', error)
              
                const resultado = await this.modal.openModal(error.message,true); 
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
           
            const resultado = await this.modal.openModal("Essa conta já está cadastrada tente outra",true); 
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
          
            // Aguarda o resultado do modal antes de continuar
            const resultado = await this.modal.openModal("Plano de contas cadastrado com sucesso",true); 
          
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

  addCostCenter() {

    const formNewCostCenter = this.formulario?.controls["FormNewCostCenter"] as FormGroup; 
    const cadastrado = this.listCostCenters.filter((response:any)=>{
      return response.codCostCenter===formNewCostCenter.controls['codCostCenter'].value
    } )[0]


    const _costCenters = this.costCenters.filter((response:any)=>{
      return response.codCostCenter===formNewCostCenter.controls['codCostCenter'].value
    } )[0]

    let _costCentersSecondary:any[]=[]

    if(!cadastrado) {   

        if(_costCenters) {             
              if(_costCenters.costCenterSub && _costCenters.costCenterSub.length>0) {
                _costCentersSecondary=_costCenters.costCenterSub?.filter((response:any)=>{
                  return response.codCostCenterSub===formNewCostCenter.controls['codCostCenterSub'].value
                } )
              }

              this.listCostCenters.push(
                { 
                  id:_costCenters.ID, 
                  codCostCenter:_costCenters.codCostCenter,
                  description:_costCenters.description,
                  expanded:false,
                  costCentersSecondary:_costCentersSecondary
                })

          }
    } else {
      _costCentersSecondary=_costCenters.costCenterSub?.filter((response:any)=>{
        return response.codCostCenterSub===formNewCostCenter.controls['codCostCenterSub'].value
      } )[0];

      cadastrado.costCentersSecondary.push(_costCentersSecondary)
    }
  }
  
  filterCostCenterSub(codCostCenter:any) {

    console.log('codCostCenter',codCostCenter);
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

  toggleSubList(codCostCenter: string) {
    const cc = this.listCostCenters.find(cat => cat.codCostCenter === codCostCenter);
    if (cc) {
      cc.expanded = !cc.expanded;
    }
  }

  deleteItem(codCostCenter: string, itemId: string) {   
    const cc = this.listCostCenters.find(cat => cat.codCostCenter === codCostCenter);     
    if (cc) {
      cc.costCentersSecondary = cc.costCentersSecondary.filter((item:any) => item.codCostCenterSub !== itemId);
    }   
  }
}
