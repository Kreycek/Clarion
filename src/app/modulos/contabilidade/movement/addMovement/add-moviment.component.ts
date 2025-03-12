import { booleanAttribute, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalOkComponent } from '../../../../modal/modal-ok/modal-ok.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { MovementService } from '../movement.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, startWith, switchMap, tap, throwError } from 'rxjs';
import { DailyService } from '../../../ferramentaGestao/daily/daily.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChartOfAccountService } from '../../chartOfAccount/chartOfAccount.service';
import { ModuloService } from '../../../modulo.service';
import { CompanyService } from '../../../ferramentaGestao/company/company.service';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

export interface User {
  name: string;
}

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
    MatSlideToggleModule,
    MatAutocompleteModule
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
      documentMiniFormCod:string=''
      documentMiniFormDescription:string=''
      isVisibleValidationCodDocumento=false;
      isVisibleValidationDescription=false;     
      isEdit=false;
      idMovement:string |null = null 
      formulario: FormGroup| null = null;
      years:any[]=[]
      currentYear: number = new Date().getFullYear();
      dailys:any[]=[] 
      public documents:any[]=[];
      movements:any[]=[];
      filteredOptions: Observable<any[]>;
      viewBtnGravarItensMovement=false;
      view: boolean = true;
      textBtnViewAll='Ocultar todos'
      filteredAccountOptions: Observable<any[]>;
      
     

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
          private coaService:ChartOfAccountService,
          private dailyService: DailyService,
          public moduloService:ModuloService,
          private companyService: CompanyService,
          public configService: ConfigService,
      ) {} 


 

  ngOnInit() {
    
    // this.companyService.getAllAutoCompleteCompanys('').subscribe((response:any)=>{     
    //   console.log('response',response);
    //     response.companys;       
    // });

    this.dailyService.getAllOnlyDailyActive().subscribe((response:any)=>{     
        this.dailys=response;  

      this.route.paramMap.subscribe(params => {

        const id = params.get('id');  // Substitua 'id' pelo nome do parâmetro

        if(id) {            
          this.isEdit=true;
          this.movimentService.getMovementById(id??'0').subscribe((response)=>{      
              console.log('Edição documento ',response);
              this.companyService.getCompanyById(response.CompanyId).subscribe((response)=>{
                console.log('AAAAA',response);
                this.years=response.Exercise;
              })

              this.documents = this.moduloService.filterDocuments(response.CodDaily, this.dailys, false);
              this.idMovement=id;    
              response.NewRegister=false;           
              this.createForm(response); 
              this.viewBtnGravarItensMovement=true; 
          })
        }
        else {
          this.isEdit=false;
          this.createForm({Active:true, NewRegister:true});   
          if(this.formMovements.controls.length==0) {
            this.addMovimento('','',(this.formMovements.controls.length+1).toString(),true,true,[]);
            this.addNewItemMoviment();
            this.viewBtnGravarItensMovement=true;
          }
        }      
       
      });
    })
  } 
    
  createForm(obj:any) {

    obj.Month=obj.Month==0 ? null : obj.Month
        this.formulario = this.fb.group({
          active: [obj.Active],
          display:[obj.Active],
          date:[obj.Date ?? new Date()],
          year:[obj.Year, Validators.required],
          month:[obj.Month, Validators.required],
          companyFullData: [obj.CompanyFullData? {Name:obj.CompanyFullData} : '', Validators.required],
          companyId:[obj.CompanyId],
          companyDocument:[obj.CompanyDocument],
          codDaily: [obj.CodDaily, Validators.required],
          codDocument: [obj.CodDocument, Validators.required],        
          movements: this.fb.array([]),
          newRegister: [obj.NewRegister],
        });      

        this.formulario?.controls['year'].setValue(!obj.Year ? '' :  obj.Year, { emitEvent: false });
        console.log('ASSA',this.formulario);

        this.hearFieldCompanyData()

        if(obj.Movements && obj.Movements.length>0) {
          obj.Movements.forEach((element:any) => {
            this.addMovimento(element.description,element.date,element.order,element.active,element.active, element.movementsItens)            
          });   
        }
  }

  verifyExistAccount(field:any, index:number) {
        const fieldValue=(field as FormGroup).controls['account']
        console.log('fieldValue ',fieldValue);
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

  prepareAutoCompleteAccount(fg:FormGroup) {

    const  accountField= fg.get('account') as FormControl;

    accountField.valueChanges.pipe(
   
      debounceTime(300), // Espera 300ms pra evitar múltiplas chamadas
      distinctUntilChanged(), // Garante que só muda se o valor for diferente
      switchMap((value) => {
        const name =  value         
        
        
     
        if (!name || name.length <2) {
          // Se o nome for vazio ou muito curto, retorna array vazio
          return of([]);
        }
    
        // Faz a chamada ao serviço e retorna os dados
        return this.coaService.getAllAutoCompleteCOA(name).pipe(
          map((response: any) => {
            const coa = response?.chartOfAccounts || [];
            console.log('COA', coa);
            return coa; // Retorna os dados processados
          }),
          catchError((err) => {
            console.error('Erro ao buscar contas:', err);
            return of([]); // Retorna array vazio em caso de erro
          })
        );
      })
    ).subscribe((response: any) => {

      this.filteredAccountOptions=of(response);
      console.log('Resultado final:', response);
    });


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

          let faMI=dds.controls['movementsItens'] as FormArray;

            const lineFb=this.itemNewMovement(
                elementMovementItens.codAccount,
                elementMovementItens.debitValue,
                elementMovementItens.creditValue,
                elementMovementItens.codAccountIva,
                false,
                elementMovementItens.date,
                elementMovementItens.active,
                true
            );

            console.log('asa222');

            this.prepareAutoCompleteAccount(lineFb);

          

          faMI.push(lineFb)
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
      const lineFb=this.itemNewMovement('','0','0','',true,new Date(),true,true);
      this.prepareAutoCompleteAccount(lineFb);
      movements.push(lineFb);
      this.viewBtnGravarItensMovement=true;
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

    let linhas:number[]=[];
    let invalidCount=0;   
  
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

  async verificarValores(): Promise<number> {
    let totalCredit = 0, totalDebit = 0;
  
    for (const [index, element] of this.formMovements.controls.entries()) {
      totalDebit = 0;totalCredit = 0
      const movement = element as FormGroup;
      const fa = movement.controls['movementsItens'] as FormArray;
  
      for (const item of fa.controls) {
        const line = item as FormGroup;       
        if(line?.controls['active'].value) {
          totalCredit += +line?.controls['credit'].value;
          totalDebit += +line?.controls['debit'].value;
        }
      }
  
      if (totalDebit !== totalCredit) {
        return 1
      }
      else  if (totalDebit==0 && totalCredit==0) {
        return 2
      }
    }
  
    return 0; // Se todas as linhas estiverem corretas, retorna true
  }
  async gravarMovimento() {

   const hasErrors = await this.verifyErrorsMovement(false,true);
    if (!hasErrors) {    
      
      this.view=false;
      this.textBtnViewAll='Exibir todos'
      
        this.verificarValores();
        // this.formMovements.controls.forEach((element:any) => {
        //     const movement=element as FormGroup;
        //     movement.controls['display'].setValue(false,{ emitEvent: false });

        //     const fa=movement.controls['movementsItens'] as FormArray;
        //     fa.controls.forEach((element:any) => {
        //         const line=element as FormGroup
        //         line.controls['display'].setValue(false,{ emitEvent: false });

        //     });
        // });
      }
  }


  async createNewMovement() {
    const hasErrors = await this.verifyErrorsMovement(false,true);
    if (!hasErrors) {      
      this.addMovimento('','',(this.formMovements.controls.length+1).toString(), true,true,[]);
      this.addNewItemMoviment();
      this.viewBtnGravarItensMovement=true;
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
    // Alterna o valor da propriedade view
    this.view = !this.view;

    if(!this.view)
      this.textBtnViewAll='Exibir todos'
    else 
     this.textBtnViewAll='Ocultar todos'
    

    // Percorre os controles do formulário e atualiza o campo 'display'
    this.formMovements.controls.forEach((element: any) => {
      const movement = element as FormGroup;
      if (movement.controls['active'].value) {
        // Aqui, setamos o valor de 'display' para o valor atual de this.view
        movement.controls['display'].setValue(this.view, { emitEvent: false });
      }
    });
  }

  async gravar() {   
    
    const hasErrors = await this.verifyErrorsMovement(true,true);
    if (hasErrors) {  
      return
    }     


    const valoresCorretos = await this.verificarValores();
  
    if (valoresCorretos==1) {
      console.log("Os valores estão corretos! Pode salvar.");
      // Chamar a função de salvar
      const resultado = await this.modal.openModal(
        `Alguns totais de débito e crédito são diferentes e não podem ser diferentes.`,
        true
      );
      return ; // Retorna o resultado diretamente
    } else if(valoresCorretos==2) {
      const resultado = await this.modal.openModal(
        `Todos os valores do movimento estão com zero, corrija.`,
        true
      );
      return ; 
    }
      
      const formValues=this.formulario?.value;      

      const objGravar: { 
        id?:string |null;
        codDaily: string;
        
        date:string;
        codDocument:string;
        companyDocument:string;
        companyFullData:string;
        companyId:string;
        active:boolean;
        year:number;
        month:number;
        movements: any[]; // Definindo o tipo correto para o array 'perfil'    
        
      } ={
        id:null,
        codDaily:formValues.codDaily,          
        date:formValues.date,
        codDocument:formValues.codDocument,       
        companyDocument:formValues.companyDocument,
        companyFullData:formValues.companyFullData.Name,    
        companyId:formValues.companyId,    
        active:formValues.active,
        movements:[],       
        month:+formValues.month,
        year:+formValues.year    
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

  
  hearFieldCompanyData() {

    const companyFullDataControl = this.formulario?.controls['companyFullData'] as FormControl;

    if (companyFullDataControl) {
      companyFullDataControl.valueChanges.pipe(
        startWith(''), // Inicia com um valor vazio
        debounceTime(300), // Evita muitas requisições em pouco tempo
        distinctUntilChanged(), // Evita chamadas repetidas com o mesmo valor
        switchMap(value => {
          const name = typeof value === 'string' ? value : value?.name;         
          // Retorna um array vazio se o nome não for suficiente
          if (!name || name.length <= 2) {
            return of([]); // Retorna um array vazio
          }

          // Chama a API para buscar as opções
          return this.companyService.getAllAutoCompleteCompanys(name || '').pipe(
            map((response: any) => {
              const companies = response.companys || [];

              // Expandindo os resultados para incluir cada documento separadamente
              return companies.flatMap((company: any) =>
                company.Documents.map((doc: any) => ({
                  Name: `${company.Name} - ${doc.country} - ${doc.nameDocument} - ${doc.documentNumber}`,
                  rawData: company // Mantém o objeto original, se necessário
                }))
              );
            }),
            catchError(() => of([])) // Em caso de erro, retorna um array vazio
          );
        })
      ).subscribe((options: any[]) => {
        // Atualiza as opções filtradas após a pesquisa
        this.filteredOptions = of(options);
      });
    }
  }
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const selectedOption = event.option.value; // Pega o valor da opção selecionada

    console.log('Auto Complete',selectedOption);
   
    if(selectedOption) { 

      this.years=selectedOption?.rawData?.Exercise;    
      const companyIdControl = this.formulario?.controls['companyId'];
      const companyDocumentControl = this.formulario?.controls['companyDocument'];     

      let palavras = selectedOption?.Name.split(" ");
      
      if (companyIdControl instanceof FormControl) {
        companyIdControl.setValue(selectedOption?.rawData?.ID, { emitEvent: false });
      }
      
      if (companyDocumentControl instanceof FormControl) {
        companyDocumentControl.setValue(palavras[palavras.length-1], { emitEvent: false });
      }

      this.formulario?.controls['year'].setValue(new Date().getFullYear(), { emitEvent: false });
    }
    // Aqui você pode fazer o que for necessário com a opção selecionada
    // Por exemplo, pode armazená-la em um campo ou realizar outras ações
  }

  onOptionAccountSelected(event: MatAutocompleteSelectedEvent, indexMovementForm:number, indexMovementItens:number) {
        
  }

  displayFn(company: any): string {
    return company ? company.Name : '';
  } 

  displayAccountFn(account: any): string {
    return account ? account.CodAccount : ''
    //  + ' - ' + account.Description : '';
  } 
}
