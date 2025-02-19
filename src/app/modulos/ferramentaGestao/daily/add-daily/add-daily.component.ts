import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ModalConfirmationComponent } from '../../../../modal/modal-confirmation/modal-confirmation.component';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalOkComponent } from '../../../../modal/modal-ok/modal-ok.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { DailyService } from '../daily.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-add-daily',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalOkComponent, FormsModule],
  templateUrl: './add-daily.component.html',
  styleUrl: './add-daily.component.css'
})
export class AddDailyComponent {

    @ViewChild(ModalOkComponent) modal!: ModalOkComponent;  

      documentMiniFormCod:string=''
      documentMiniFormDescription:string=''
      isVisibleValidationCodDocumento=false;
      isVisibleValidationDescription=false;
     
     isEdit=false;
     idDaily:string |null = null 
     formulario: FormGroup| null = null;
     years:number[]=[]
     currentYear: number = new Date().getFullYear();
    get documentForm() {
       return (this.formulario?.get('documents') as FormArray);
     }
     constructor(     
         private fb: FormBuilder,
         private dailyService:DailyService,
         private route: ActivatedRoute,
         private router: Router, 
         public configService:ConfigService,
         private cdr: ChangeDetectorRef
     ) {} 


  ngOnInit() {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');  // Substitua 'id' pelo nome do parâmetro

        if(id) {
          this.isEdit=true;
          this.dailyService.getDailyById(id??'0').subscribe((response)=>{       
            console.log('dailys',response);
            this.idDaily=id;    
            this.createForm(response);  

            if(response.Documents && response.Documents.length>0) {
              response.Documents.forEach((element:any) => {
                console.log('element',element);
                this.documentForm.push(this.createDocumentForm(element.codDocument,element.description));
              });
            }
          })
        }
        else {
          this.isEdit=false;
          this.createForm({Active:true});   
        }
        console.log('this.formulario',this.formulario);
      });    
  }

    
  createForm(obj:any) {
        this.formulario = this.fb.group({
          active: [obj.Active, Validators.required],
          codDaily: [obj.CodDaily, Validators.required],
          description: [obj.Description, Validators.required],
          documents: this.fb.array([] ),
          FormNewDocuments: new FormGroup({  // Subformulário dentro do formulário principal
            codDocument: new FormControl(''),
            description: new FormControl('')
          })
        }); 

        this.formulario.get('FormNewDocuments.codDocument')?.valueChanges.subscribe(value => {
          console.log('Novo valor de codDocument:', value);
          if(value) {
            this.isVisibleValidationCodDocumento=true;
          }
          else {
            this.isVisibleValidationCodDocumento=false;
          }
        });
    
        // Para monitorar todos os campos dentro de FormNewDocuments
        this.formulario.get('FormNewDocuments.description')?.valueChanges.subscribe(value => {

          if(value) {
            this.isVisibleValidationDescription=true;
          }
          else {
            this.isVisibleValidationDescription=false;
          }
          
          console.log('Valores do FormNewDocuments:', value);
        });

    }
        
  createDocumentForm(codDocument:string, description:string): FormGroup {
      return this.fb.group({  
        codDocument: [codDocument],
        description: [description]    
      });
  }

  async addDocument() {    
    if(this.isVisibleValidationDescription && this.isVisibleValidationDescription) {
     
      const form = this.formulario?.controls["FormNewDocuments"] as FormGroup;
      const result = this.documentForm.controls.filter((element:any)=>{
          const valor=(element as FormGroup).controls["codDocument"].value;
          return valor==form.controls["codDocument"].value
      })[0];
      if(result) {
        const resultado = await this.modal.openModal("Essa documento já está cadastrado para esse diário",true); 
          if (resultado) {          
            this.cdr.detectChanges();
          }
      }
      else {
        this.documentForm.push(this.createDocumentForm(form.controls["codDocument"].value,form.controls["description"].value));
        form.controls["codDocument"].setValue('',{ emitEvent: false })
        form.controls["description"].setValue('',{ emitEvent: false })
        this.isVisibleValidationCodDocumento=false; 
        this.isVisibleValidationDescription=false;
      }
    
    }
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
  
      console.log('objGravar',objGravar);
      if(this.idDaily) {
  
        objGravar.id=this.idDaily
          this.dailyService.updateDaily(objGravar).pipe(
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
  
        this.dailyService.verifyExistsDaily({codDaily:objGravar.codDaily}).subscribe((async (response:any)=>{
          if(response.message) {              
              const resultado = await this.modal.openModal("Esse código de diário já está cadastrado tente outro",true); 
              if (resultado) {
              
              }
          }
          else {
            
            this.dailyService.addDaily(objGravar).pipe(
              catchError((error: HttpErrorResponse) => {   
                if (error.status === 401) {
                  console.log('Interceptando requisição:', error.status);
                }
                return throwError(() => error);
              })
            ).subscribe(async () => {            
            
              // Aguarda o resultado do modal antes de continuar
              const resultado = await this.modal.openModal("Usuário cadastrado com sucesso",true);             
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

    
}
