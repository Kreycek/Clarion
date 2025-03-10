import { booleanAttribute, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalOkComponent } from '../../../../modal/modal-ok/modal-ok.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { MovementService } from '../movement.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { DailyService } from '../../../ferramentaGestao/daily/daily.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChartOfAccountService } from '../../chartOfAccount/chartOfAccount.service';
import { ModuloService } from '../../../modulo.service';

@Component({
  selector: 'app-add-moviment',
  standalone: true,
  imports: [    
    ModalOkComponent, 
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatNativeDateModule,
    MatSlideToggleModule 
  ],
  templateUrl: './add-moviment.component.html',
  styleUrl: './add-moviment.component.css',
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  animations: [
    trigger('transformPanel', [
      transition('void => *', [
        style({ transform: 'scale(0)' }),
        animate('300ms ease-in', style({ transform: 'scale(1)' }))
      ])
    ])
  ]

})
export class AddMovimentComponent {
  @ViewChild(ModalOkComponent) modal!: ModalOkComponent; 
  
  calendarOpen = false;

    toggleCalendar() {
      this.calendarOpen = !this.calendarOpen;
    }
      documentMiniFormCod:string=''
      documentMiniFormDescription:string=''
      isVisibleValidationCodDocumento=false;
      isVisibleValidationDescription=false;     
      isEdit=false;
      idMovement:string |null = null 
      formulario: FormGroup| null = null;
      years:number[]=[]
      currentYear: number = new Date().getFullYear();
      dailys:any[]=[] 
      public documents:any[]=[];
      movements:any[]=[]

      get documentForm() {
        return (this.formulario?.get('documents') as FormArray);
      }

      get formMovements(): FormArray {
        return this.formulario?.get('movements') as FormArray;
      }

      constructor(     
          private fb: FormBuilder,
          private movimentService:MovementService,
          private route: ActivatedRoute,
          private router: Router, 
          public configService:ConfigService,
          private coaService:ChartOfAccountService,
          private dailyService: DailyService,
          public moduloService:ModuloService
      ) {} 


  ngOnInit() {
    
      this.dailyService.getAllOnlyDailyActive().subscribe((response:any)=>{     
        this.dailys=response;        
      

      this.route.paramMap.subscribe(params => {
        const id = params.get('id');  // Substitua 'id' pelo nome do parâmetro

        if(id) {          
          this.isEdit=true;
          this.movimentService.getMovementById(id??'0').subscribe((response)=>{              
           this.documents = this.moduloService.filterDocuments(response.CodDaily, this.dailys, false)
            this.idMovement=id;    
            response.NewRegister=false;           
            this.createForm(response);  

          })
        }
        else {
          this.isEdit=false;
          this.createForm({Active:true, NewRegister:true});   
          if(this.formMovements.controls.length==0) {

            this.addMovimento('','',(this.formMovements.controls.length+1).toString(),true,true,[]);
            this.addNewItemMoviment();
          }
        }
      
      });    

    })
  }


    
  createForm(obj:any) {
        this.formulario = this.fb.group({
          active: [obj.Active],
          display:[obj.Active],
          date:[obj.Date, Validators.required],
          codDaily: [obj.CodDaily, Validators.required],
          codDocument: [obj.CodDocument, Validators.required],        
          movements: this.fb.array([]),
          newRegister: [obj.NewRegister],
        });      

        if(obj.Movements && obj.Movements.length>0) {
          obj.Movements.forEach((element:any) => {
            this.addMovimento(element.description,element.date,element.order,element.active,element.active, element.movementsItens)            
          });   
        }
  }


  verifyExistAccount(field:any, index:number) {
        const fieldValue=(field as FormGroup).controls['account']
        if(fieldValue.value) {
          this.coaService.verifyExistsChartOfAccounts({codAccount:fieldValue.value}).subscribe(async (response:any)=>{
            if(!response.message) {           
                const resultado = await this.modal.openModal("A Conta cadastrada na linha " + (index).toString() + " não está cadastrada no plano de contas, tente outra!",true); 
                if (resultado) {
                  fieldValue.setValue(null,{ emitEvent: false });
                }
              }
            })
        }
  }

  addMovimento(description: string, date: string, order:string, active:boolean, display:boolean, movementItens:any[]) {
    const dds= this.fb.group({
      order:order,
      description: [description, Validators.required],
      date: [date, Validators.required] ,
      active:active,
      display:display,
      selected:true,
      movementsItens: this.fb.array([])
    });

    if(movementItens && movementItens.length>0) {

      movementItens.forEach((elementMovementItens:any)=>{

        let faMI=dds.controls['movementsItens'] as FormArray

        faMI.push(this.itemNewMovement(

          elementMovementItens.codAccount,
          elementMovementItens.debitValue,
          elementMovementItens.creditValue,
          elementMovementItens.codAccountIva,
          false,
          elementMovementItens.date,
          elementMovementItens.active,
          false
        ))

      })

    }
    this.formMovements.insert(0,dds);      
  }



  addNewItemMoviment() {
  
    const movement = this.formMovements.controls.filter((element:any)=>{
      return (element as FormGroup).controls['display'].value && (element as FormGroup).controls['selected'].value;
    })[0];

    if(movement) {
      const movements=(movement as FormGroup).controls['movementsItens'] as FormArray;
      movements.push(this.itemNewMovement('','','','',true,new Date(),true,true));
    }
  }

  
  itemNewMovement(account: string, debit: string, credit: string, accountIva:string, newRegister:boolean,  date:Date, active:boolean,display:boolean): FormGroup {
    return this.fb.group({
      account: [account, Validators.required],
      debit: [debit, Validators.required],
      credit: [credit, Validators.required],
      accountIva:[accountIva],
      date:[date],
      active:active,
      display:display,
      newRegister: [newRegister],
    });
  }

  convertToFormArray(obj: any) {
    return obj as FormArray
  }

  createDocumentForm(codDocument:string, description:string): FormGroup {
      return this.fb.group({  
        codDocument: [codDocument],
        description: [description]    
      });
  }

  async verifyErrorsMovement(formGeral:boolean,formMovements:boolean) : Promise<boolean> {

    let linhas:number[]=[]
    let invalidCount=0
   
  
    if(formGeral) {
      if(this.formulario?.invalid ) {
          this.formulario.markAllAsTouched();
          const resultado = await this.modal.openModal("Existem dados preenchidos incorretamente, volte e corrija antes de avançar.",true); 
          if (resultado) {    
            return await  true;            
          }     

      }
      
    }

    if(formMovements) {

        this.formMovements.controls.forEach((elementFAM:any, indexLinha:number)=>{
          const fm=elementFAM as FormGroup
          if(elementFAM.invalid) {
            invalidCount++
            linhas.push(+fm.controls['order'].value)
          }

        })

        if(linhas.length>0) {
          this.formMovements.markAllAsTouched();
            const resultado = await this.modal.openModal("Existem dados de movimento inválidos" + (linhas.length>1 ? ' nas linhas ' : ' na linha ') + linhas.sort().join(',') + ' corrija antes de avançar.',true); 
              if (resultado) {    
                return await  true;        
              }       
        }

      }
    
    
  
      return await  false
    
  }

  async gravarMovimento() {

   const hasErrors = await this.verifyErrorsMovement(false,true);
    if (!hasErrors) {         
        this.formMovements.controls.forEach((element:any) => {
            const movement=element as FormGroup;
            movement.controls['display'].setValue(false,{ emitEvent: false });

            const fa=movement.controls['movementsItens'] as FormArray;
            fa.controls.forEach((element:any) => {
                const line=element as FormGroup
                line.controls['display'].setValue(false,{ emitEvent: false });

            });
        });

        }
  }


  async createNewMovement() {
    const hasErrors = await this.verifyErrorsMovement(false,true);
    if (!hasErrors) {      
      this.addMovimento('','',(this.formMovements.controls.length+1).toString(), true,true,[]);
      this.addNewItemMoviment()
    }
  }
  lineDisableOutIndex(index:number) {

    this.formMovements.controls.forEach((elementFAM:any, indexLinha:number)=>{
        const faMovementsItens=(elementFAM as FormGroup)
        if(indexLinha==index) {
          faMovementsItens.controls['display'].setValue(true,{ emitEvent: false });
          faMovementsItens.controls['selected'].setValue(true,{ emitEvent: false });
        }
        else {
          faMovementsItens.controls['selected'].setValue(false,{ emitEvent: false });
        }
          const faMovements=faMovementsItens.controls['movementsItens'] as FormArray
        faMovements.controls.forEach((element:any) => {           
          const line=element as FormGroup
          line.controls['display'].setValue(indexLinha==index ? true : false,{ emitEvent: false });
        })
    } )    
  }

  viewAllMovements() {
    
    this.formMovements.controls.forEach((element:any) => {
      const movement=element as FormGroup;

      if(movement.controls['active'].value)
      movement.controls['display'].setValue(true,{ emitEvent: false });        
  });

  return 0

  }

  

  async gravar() {
    
    const hasErrors = await this.verifyErrorsMovement(true,true);
    if (hasErrors) {  
      return
    }
      
      
      const formValues=this.formulario?.value;
      const objGravar: { 
        id?:string |null;
        codDaily: string;
        description: string;
        date:string;
        codDocument:string;
        active:boolean;
        movements: any[]; // Definindo o tipo correto para o array 'perfil'    
        
      } ={
        id:null,
        codDaily:formValues.codDaily,
        description:formValues.description??'',       
        date:formValues.date,
        codDocument:formValues.codDocument,       
        active:formValues.active,
        movements:[],           
      }     
      
      if(formValues.movements && formValues.movements.length) {   
        
        interface ElementMovement {
          order: number;
          active: boolean;
          date: string;
          description: string;
          movementsItens: ElementMovementsItens[]; // Especificando o tipo correto para o array
        }

              interface  ElementMovementsItens {
                date:String,
                codAccount:String,
                debitValue:String,
                creditValue:String,
                codAccountIva:String,
                active:Boolean
              };
              
        
                formValues.movements.forEach((element:any) => {       

                         let elementMovement: ElementMovement = { 
                              order:+element.order,                         
                              active:element.active, 
                              date:element.date,
                              description:element.description,
                              movementsItens:[]
                          }

                            if(element.movementsItens && element.movementsItens.length>0) {

                              element.movementsItens.forEach((elementItens:any) => {                             
                                let elementMovementsItens: ElementMovementsItens = {
                                  date: elementItens.date,
                                  codAccount: elementItens.account,
                                  debitValue: elementItens.debit,
                                  creditValue: elementItens.credit,
                                  codAccountIva: elementItens.accountIva,
                                  active: elementItens.active,
                                };


                                elementMovement.movementsItens.push(
                                  elementMovementsItens
                                 
                                )

                              })

                            }


                     objGravar.movements.push(elementMovement)  
               });     
               
               console.log('objGravar',objGravar);
      }   
  
      
      if(this.idMovement) {
  
        objGravar.id=this.idMovement
          this.movimentService.updateMovement(objGravar).pipe(
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
  
    
            this.movimentService.addMovement(objGravar).pipe(
              catchError((error: HttpErrorResponse) => {   
                if (error.status === 401) {
                  console.log('Interceptando requisição:', error.status);
                }
                return throwError(() => error);
              })
            ).subscribe(async () => {            
            
              // Aguarda o resultado do modal antes de continuar
              const resultado = await this.modal.openModal("Movimento cadastrado com sucesso",true);             
              if (resultado) {
                console.log("Usuário confirmou!");
                // Insira aqui a lógica para continuar após a confirmação
              } else {
                console.log("Usuário cancelou.");
              }
            });
            
            
  
  
      
         }       
    }         
         
    cancel() {
      this.router.navigate(['/aplicacao/movement']);
    }

    deleteDocument(index:number) {
      this.documentForm.removeAt(index);
    }

    getControlMainForm(fieldName:string) {
      return this.formulario?.get(fieldName)
    }

    getControl(index: number, fieldName:string) {     
      return this.formMovements.at(index).get(fieldName);
    }  

    getMovementsItens(index: number): FormArray {
      return this.formMovements.at(index).get('movementsItens') as FormArray;
    }

    
    getAccountControl(movementIndex: number, itemIndex: number ,fieldName:string) {
      // console.log(this.getMovementsItens(movementIndex).at(itemIndex));
      return this.getMovementsItens(movementIndex).at(itemIndex).get(fieldName);
    }


    
    deleteMovement(index: number): FormArray {

      const linha = this.formMovements.at(index)
      if(linha?.get('newRegister')?.value) {
        this.formMovements.removeAt(index)
      }
      else {
        linha?.get('active')?.setValue(false,{ emitEvent: false })
        linha?.get('display')?.setValue(false,{ emitEvent: false })
      }

      return this.formMovements.at(index).get('movementsItens') as FormArray;
    }

    deleteMovementItens(movementIndex: number, itemIndex: number) {
      const linha=this.getMovementsItens(movementIndex).at(itemIndex);
      if(linha?.get('newRegister')?.value)
        this.getMovementsItens(movementIndex).removeAt(itemIndex)
      else {
        linha?.get('active')?.setValue(false,{ emitEvent: false })
        linha?.get('display')?.setValue(false,{ emitEvent: false })
      }
    }
 
    // aplicarMascaraPreco(event: Event): void {
    //   const input = event.target as HTMLInputElement;
    //   let valor = input.value;
  
    //   // Remove tudo o que não for número ou vírgula
    //   valor = valor.replace(/[^0-9,]/g, '');
  
    //   // Adiciona o ponto como separador de milhar
    //   valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
    //   // Coloca a vírgula como separador decimal (se houver)
    //   if (valor.indexOf(',') !== -1) {
    //     let partes = valor.split(',');
    //     partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Aplica ponto aos milhares
    //     valor = partes.join(',');
    //   } else {
    //     valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    //   }
  
    //   // Atualiza o valor no campo de entrada
    //   input.value = valor;
    // }
    aplicarMascaraPreco(event: Event): void {

      const input = event.target as HTMLInputElement;

    let value = input.value;

    // Remove todos os caracteres não numéricos, exceto o ponto
    value = value.replace(/[^0-9.]/g, '');
  
    // Adiciona os pontos de milhar
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '');
  
    // Atualiza o valor do campo de entrada
    input.value = value;

  }

}
