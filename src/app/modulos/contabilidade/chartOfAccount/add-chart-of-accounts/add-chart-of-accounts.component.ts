import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl,FormControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';import { catchError, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalOkComponent } from '../../../../modal/modal-ok/modal-ok.component';
import { ChartOfAccountService } from '../chartOfAccount.service';
import { ConfigService } from '../../../../services/config.service';
import { CostCenterService } from '../../../ferramentaGestao/costCenter/costCenter.service';
import { ModuloService } from '../../../modulo.service';

@Component({
  selector: 'app-add-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalOkComponent, FormsModule],
  templateUrl: './add-chart-of-accounts.component.html',
  styleUrl: './add-chart-of-accounts.component.css'
})
export class AddChartOfAccountsComponent {
  
  isEdit=false;
  idchartOfAccount:string |null = null 
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
      public moduloService:ModuloService
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
 

  trackByFn(index: number, item: any): string {
    return item.codCostCenterSecondary; // Garante que cada item tem uma chave única
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

      this.costCenterService.getAllOnlyCostCenter().subscribe((response:any)=>{     
        this.costCenters=response;    

      if(id) {
        this.isEdit=true;
        this.coaService.getChartOfAccountById(id??'0').subscribe((COA:any)=>{   

            if(COA.CostCentersCOA && COA.CostCentersCOA.length>0) {

                COA.CostCentersCOA.forEach((element:any) => {

                    let dados:any={ 
                      id:'',
                      codCostCenter:'',
                      description:'',
                      expanded:false,
                      costCentersSecondary:[]
                    }              
                

                    const _costCenterFind=this.costCenters.filter((elementCC:any)=>{
                      return elementCC.ID==element.idCostCenter
                    })[0];
                    
                    if(_costCenterFind) {

                      dados.id=_costCenterFind.ID  
                      dados.description=_costCenterFind.description;
                      dados.codCostCenter=_costCenterFind.codCostCenter
                    
                      const _costCenterFindSecundario=structuredClone(element.costCentersSecondary);              

                      if(_costCenterFindSecundario && _costCenterFindSecundario.length>0) {

                          _costCenterFindSecundario.forEach((elementCCS:any) => {  
                          
                              const _costCenterSecundarioFind= structuredClone(_costCenterFind.costCenterSecondary.filter((elementCC:any)=>{
                                return elementCC.codCostCenterSecondary==elementCCS
                              })[0]);

                              dados.costCentersSecondary.push({
                                  codCostCenterSecondary:_costCenterSecundarioFind.codCostCenterSecondary,
                                  description:_costCenterSecundarioFind.description
                              })
                          
                          });
                      }                   

                      this.listCostCenters.push(dados)            
                        
                    }
                
                });
              }

        
          
          this.idchartOfAccount=id;    
          this.createForm(COA);     
          this.loadYear(COA.Year,false)    
        })
      }
      else {
        this.isEdit=false;
        this. createForm({Active:true});       
        this.loadYear([],true)
      }

    })
      
    });    
  }

  loadYear(years:[], newRegister:boolean) {    
    for(let year=this.configService.years[0] ;year<=this.currentYear+1;year++) {   
      const exist:boolean=years.filter((_year:number)=>year==_year)[0]    
      this.yearForm.push(this.criarYear(year,newRegister ? true : exist?true:false));
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
                  codCostCenter:new FormControl('0',[Validators.required]),
                  codCostCenterSecondary: new FormControl('',[Validators.required]),                
                })
        }); 
  }

  async abrirModalConfirmacao(msgModal:string) {
  
    const resultado = await this.modal.openModal(msgModal,true); 

    if (resultado) {
     
    } else {
      
      
    }
  }

  gravar() {   
    
    const formNewCostCenter=this.formulario?.controls["FormNewCostCenter"] as FormGroup
    this.moduloService.desabilitaCamposFormGroup(formNewCostCenter);     

    if (this.formulario?.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }    

    this.moduloService.habilitaCamposFormGroup(formNewCostCenter,['codCostCenter','codCostCenterSecondary'])

    const formValues=this.formulario?.value;
    const objGravar: { 
      id?:string |null;
      codAccount: string;
      description: string;
      type: string;      
      active:boolean;
      year: number[]; // Definindo o tipo correto para o array 'perfil'  
      costCentersCOA: any[]
      
    } ={
      id:null,
      codAccount:formValues.codAccount,
      description:formValues.description??'',
      type:formValues.type,   
      active:formValues.active,
      year:[],
      costCentersCOA:[]           
    }   
   
    if(formValues.year && formValues.year.length) {       
      formValues.year.forEach((element:any) => {
        if(element.ativo)
        objGravar.year.push(element.value)  
      });              
    }   

    if(this.listCostCenters && this.listCostCenters.length>0) {
      this.listCostCenters.forEach((element:any)=>{
        let cc:{idCostCenter:number, costCentersSecondary:string[]}={idCostCenter:element.id,costCentersSecondary:[]}
       
          if(element.costCentersSecondary && element.costCentersSecondary.length>0) {
            element.costCentersSecondary.forEach((elementSecondary:any)=>{
            cc.costCentersSecondary.push(elementSecondary.codCostCenterSecondary)
            })
          }        
        objGravar.costCentersCOA.push(cc);
      })      
    }
  
    if(this.idchartOfAccount) {

      objGravar.id=this.idchartOfAccount
        this.coaService.updateChartOfAccounts(objGravar).pipe(
        tap(async (response:any) =>    {    
        
         const resultado = await this.modal.openModal(response.message,true); 
         if (resultado) {
          this.cancel();
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

          })).subscribe(()=>{})
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
             this.listCostCenters=[];
             this.moduloService.deleteFormArrayData(this.yearForm);  
             this.formulario?.reset();
             this.loadYear([],true)             
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

  async addCostCenter() {

    const formNewCostCenter = this.formulario?.controls["FormNewCostCenter"] as FormGroup;    
    const codCostCenterInsert=formNewCostCenter.controls['codCostCenter'].value;
    let existeRepetido=0;

    if(codCostCenterInsert!=0) {

          const cadastrado = this.listCostCenters.filter((response:any)=>{
            return response.codCostCenter===codCostCenterInsert
          } )[0]

          const _costCenters = this.costCenters.filter((response:any)=>{
            return response.codCostCenter===codCostCenterInsert
          } )[0]

          let _costCentersSecondary:any[]=[]
          const codCostCenterSecundario=formNewCostCenter.controls['codCostCenterSecondary'].value;
       
          if(!cadastrado) {              
              if(_costCenters) {           
                    if(_costCenters.costCenterSecondary && _costCenters.costCenterSecondary.length>0) {
                      _costCentersSecondary=_costCenters.costCenterSecondary?.filter((response:any)=>{
                        return codCostCenterSecundario!=0 ? response.codCostCenterSecondary===codCostCenterSecundario : 1==1
                      })
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
                _costCentersSecondary=_costCenters.costCenterSecondary?.filter((response:any)=>{
                    return codCostCenterSecundario!=0 ? response.codCostCenterSecondary===codCostCenterSecundario : 1==1
                } );             

                if(_costCentersSecondary && _costCentersSecondary.length>0) {
                    _costCentersSecondary.forEach(async (costCenterSecundario:any)=>{
                      const ccSecundarioJaExsite=cadastrado.costCentersSecondary.some((element:any)=>element.codCostCenterSecondary==costCenterSecundario.codCostCenterSecondary)
                      if(!ccSecundarioJaExsite) {                       
                        cadastrado.costCentersSecondary.push(costCenterSecundario)
                      }else {
                       
                        if(codCostCenterSecundario!=0) {
                           const resultado = await this.modal.openModal("Centro de custo secundário já cadastrado para essa conta",true);                           
                        if (resultado) {          
                        
                        }
                       } else {
                        existeRepetido++;
                       }
                      }
                  })

                  if(existeRepetido>0) {
                    const resultado = await this.modal.openModal("Todos os centros de custo já foram atribuidos para essa conta",true); 
                          
                    if (resultado) {          
                    
                    }
                  }          
              }
          }
    }  else {
      existeRepetido=0;

     this.costCenters.forEach((element:any)=>{
            const cadastrado = this.listCostCenters.filter((response:any)=>{
              return response.codCostCenter===element.codCostCenter
            } )[0];

           
         
                if(!cadastrado) {
                    this.listCostCenters.push({ 
                        id:element.ID, 
                        codCostCenter:element.codCostCenter,
                        description:element.description,
                        expanded:false,
                        costCentersSecondary:element.costCenterSecondary
                      })
                }
                else {
                  element.costCenterSecondary.forEach((element:any) => {
                      const existSecondary=cadastrado.costCentersSecondary.some((ccs:any)=>ccs.codCostCenterSecondary==element.codCostCenterSecondary)
                      if(!existSecondary) {
                        cadastrado.costCentersSecondary.push(element)
                      }
                  });

                  existeRepetido++
                }
      } );

      if(existeRepetido>0) {

          const resultado = await this.modal.openModal("Todos os centros de custo já foram atribuidos para essa conta",true); 
                              
          if (resultado) {          
          
          }
      }
    }
  
  }
  
  filterCostCenterSecondary(codCostCenter:any) {

  
    let _costCenters=[]
    _costCenters=this.costCenters.filter((response:any)=>{
      return response.codCostCenter===codCostCenter

    } )[0]

    if(_costCenters) {
      this.costCentersSub=[];

      if(_costCenters.costCenterSecondary && _costCenters.costCenterSecondary.length>0)    {       
        this.costCentersSub= [..._costCenters.costCenterSecondary];
        this.costCentersSub.unshift({
          "codCostCenterSecondary": "0",
          "description": "Todos",
          "dtAdd": ""
        } )

        const formNewCostCenter = this.formulario?.controls["FormNewCostCenter"] as FormGroup;  
        formNewCostCenter.controls["codCostCenterSecondary"].setValue('0')

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
      cc.costCentersSecondary = cc.costCentersSecondary.filter((item:any) => item.codCostCenterSecondary !== itemId);
    }   
  }

  deleteCostCenter(codCostCenter: string) {      
   
    this.listCostCenters =this.listCostCenters.filter(cat => cat.codCostCenter != codCostCenter);     

  }
}
