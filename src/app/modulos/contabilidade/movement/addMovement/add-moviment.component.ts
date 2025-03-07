import { Component, ViewChild } from '@angular/core';
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
      idDaily:string |null = null 
      formulario: FormGroup| null = null;
      years:number[]=[]
      currentYear: number = new Date().getFullYear();
      dailys:any[]=[] 
      documents:any[]=[];
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
      ) {} 


  ngOnInit() {
    
      this.dailyService.getAllOnlyDailyActive().subscribe((response:any)=>{     
        this.dailys=response;        
      })

      this.route.paramMap.subscribe(params => {
        const id = params.get('id');  // Substitua 'id' pelo nome do parâmetro

        if(id) {
          this.isEdit=true;
          this.movimentService.getMovementById(id??'0').subscribe((response)=>{       
           
            this.idDaily=id;    
            this.createForm(response);  

            if(response.Documents && response.Documents.length>0) {
              response.Documents.forEach((element:any) => {
              
                this.documentForm.push(this.createDocumentForm(element.codDocument,element.description));
              });
            }
          })
        }
        else {
          this.isEdit=false;
          this.createForm({active:true});   
          if(this.formMovements.controls.length==0) {

            this.addMovimento('','',(this.formMovements.controls.length+1).toString(),[]);
            this.addNewItemMoviment();
          }
        }
      
      });    
  }

  filterDocuments(codDaily:any) {

      let _documents=[]
      _documents=this.dailys.filter((response:any)=>{
        return response.codDaily===codDaily

      } )[0]

      if(_documents) {
        this.documents=[];
        
        if(_documents.documents && _documents.documents.length>0) {        
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
  }
    
  createForm(obj:any) {
        this.formulario = this.fb.group({
          active: [obj.active, Validators.required],
          display:[obj.display],
          codDaily: [obj.codDaily, Validators.required],
          codDocument: [obj.codDocument, Validators.required],
          description: [obj.description, Validators.required],
          movements: this.fb.array([]),
          newRegister: [obj.newRegister??true],
        });      
  }


  verifyExistAccoun(field:any, index:number) {
        const fieldValue=(field as FormGroup).controls['account']
        if(fieldValue.value) {
          this.coaService.verifyExistsChartOfAccounts({codAccount:fieldValue.value}).subscribe(async (response:any)=>{
            if(!response.message) {           
                const resultado = await this.modal.openModal("Existe uma conta na linha " + (index).toString() + " cadastrada no plano de contas tente outra",true); 
                if (resultado) {
                  fieldValue.setValue(null,{ emitEvent: false });
                }
              }
            })
        }
  }

  addMovimento(description: string, date: string, order:string, movement: any[]) {
    const dds= this.fb.group({
      order:order,
      description: [description, Validators.required],
      date: [date, Validators.required] ,
      active:true,
      display:true,
      selected:true,
      movementsItens: this.fb.array([])
    });
    this.formMovements.insert(0,dds);      
  }

  itemNewMovement(account: string, debit: string, credit: string, iva:string, newRegister:boolean): FormGroup {
    return this.fb.group({
      account: [account, Validators.required],
      debit: [debit, Validators.required],
      credit: [credit, Validators.required],
      iva:[iva],
      active:true,
      display:true,
      newRegister: [newRegister??true],
    });
  }


  addNewItemMoviment() {
  
    const movement = this.formMovements.controls.filter((element:any)=>{
      return (element as FormGroup).controls['display'].value && (element as FormGroup).controls['selected'].value;
    })[0];

    if(movement) {
      const movements=(movement as FormGroup).controls['movementsItens'] as FormArray;
      movements.push(this.itemNewMovement('','','','',true));
    }
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

  async gravarMovimento() {

    let linhas:number[]=[]

    let invalidCount=0
    this.formMovements.controls.forEach((elementFAM:any, indexLinha:number)=>{
      const fm=elementFAM as FormGroup
      if(elementFAM.invalid) {
        invalidCount++
        linhas.push(+fm.controls['order'].value)
      }

    })

    if(invalidCount>0) {
      this.formMovements.markAllAsTouched();
        const resultado = await this.modal.openModal("Existem dados de movimento inválidos" + (linhas.length>1 ? ' nas linhas ' : ' na linha ') + linhas.sort().join(',') + ' corriga antes de avançar.',true); 
          if (resultado) {            
          }       
    }
    else {

    console.log('invalidCount',invalidCount);

    // if (this.formulario?.invalid) {
    //   this.formulario.markAllAsTouched();
    //   return;
    // }   

    this.formMovements.controls.forEach((element:any) => {
        const movement=element as FormGroup;
        movement.controls['display'].setValue(false,{ emitEvent: false });

        const fa=movement.controls['movementsItens'] as FormArray;
        fa.controls.forEach((element:any) => {
            const line=element as FormGroup
            line.controls['display'].setValue(false,{ emitEvent: false });

        });
    });

    this.addMovimento('','',(this.formMovements.controls.length+1).toString(),[]);
    this.addNewItemMoviment()

    console.log('objGravar',this.formulario);
    console.log('this.formMovements qtd',(this.formMovements.controls.length+1));
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
      movement.controls['display'].setValue(true,{ emitEvent: false });        
  });

  return 0

  }


  gravar() {
    
      if (this.formulario?.invalid) {
        this.formulario.markAllAsTouched();
        return;
      }
      
      const formValues=this.formulario?.value;
      const objGravar: { 
        id?:string |null;
        codDaily: string;
        description: string;
        active:boolean;
        documents: any[]; // Definindo o tipo correto para o array 'perfil'    
        
      } ={
        id:null,
        codDaily:formValues.codDaily,
        description:formValues.description??'',       
        active:formValues.active,
        documents:[],           
      }     
      
      if(formValues.documents && formValues.documents.length) {       
        formValues.documents.forEach((element:any) => {       
          objGravar.documents.push({codDocument:element.codDocument, description:element.description})  
        });              
      }   
  
      
      if(this.idDaily) {
  
        objGravar.id=this.idDaily
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
  
        this.movimentService.verifyExistsMovement({codDaily:objGravar.codDaily}).subscribe((async (response:any)=>{
          if(response.message) {              
              const resultado = await this.modal.openModal("Esse código de diário já está cadastrado tente outro",true); 
              if (resultado) {
              
              }
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
        }))
  
      
        }       
    }         
         
    cancel() {
      this.router.navigate(['/aplicacao/daily']);
    }

    deleteDocument(index:number) {
      this.documentForm.removeAt(index);
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

    deleteMovement(movementIndex: number, itemIndex: number) {
      const linha=this.getMovementsItens(movementIndex).at(itemIndex);
      if(linha?.get('newRegister')?.value)
        this.getMovementsItens(movementIndex).removeAt(itemIndex)
      else {
        linha?.get('active')?.setValue(false,{ emitEvent: false })
        linha?.get('display')?.setValue(false,{ emitEvent: false })
      }
    }
}
