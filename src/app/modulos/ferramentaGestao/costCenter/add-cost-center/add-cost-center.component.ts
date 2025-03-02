
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalOkComponent } from '../../../../modal/modal-ok/modal-ok.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { CostCenterService } from '../costCenter.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { ModuloService } from '../../../modulo.service';

@Component({
  selector: 'app-add-cost-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalOkComponent, FormsModule],
  templateUrl: './add-cost-center.component.html',
  styleUrl: './add-cost-center.component.css'
})
export class AddCostCenterComponent {
  
      @ViewChild(ModalOkComponent) modal!: ModalOkComponent;  
       idCostCenter:string |null = null 
       formulario: FormGroup| null = null;
    
      get costCenterSecondaryForm() {
         return (this.formulario?.get('costCenterSecondary') as FormArray);
       }
       constructor(     
           private fb: FormBuilder,
           private costCenterService:CostCenterService,
           private route: ActivatedRoute,
           private router: Router, 
           public configService:ConfigService,
           private cdr: ChangeDetectorRef,
           public moduloService:ModuloService
       ) {} 
  
  
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
          const id = params.get('id');  // Substitua 'id' pelo nome do parâmetro
  
          if(id) {           
            this.costCenterService.getCostCenterById(id??'0').subscribe((response)=>{       
              console.log('dailys',response);
              this.idCostCenter=id;    
              this.createForm(response);  
  
              if(response.CostCenterSecondary && response.CostCenterSecondary.length>0) {
                response.CostCenterSecondary.forEach((element:any) => {
                  console.log('element',element);
                  this.costCenterSecondaryForm.push(this.createCostCenterSecondaryForm(element.codCostCenterSecondary,element.description));
                });
              }
            })
          }
          else {            
            this.createForm({Active:true});   
          }
          console.log('this.formulario',this.formulario);
        });    
    } 
      
    createForm(obj:any) {
          this.formulario = this.fb.group({
            active: [obj.Active, Validators.required],
            codCostCenter: [obj.CodCostCenter, Validators.required],
            description: [obj.Description, Validators.required],
            costCenterSecondary: this.fb.array([] ),
            FormNewCostCenterSecondary: new FormGroup({  // Subformulário dentro do formulário principal
              codCostCenterSecondary:new FormControl('',[Validators.required]),
              description: new FormControl('',[Validators.required])
            })
          }); 
      }
          
    createCostCenterSecondaryForm(codDocument:string, description:string): FormGroup {
        return this.fb.group({  
          codCostCenterSecondary: [codDocument],
          description: [description]    
        });
    }
  
    async addCostCenter() { 
      if(this.formulario?.controls["FormNewCostCenterSecondary"].valid) {
        const form = this.formulario?.controls["FormNewCostCenterSecondary"] as FormGroup;
        const result = this.costCenterSecondaryForm.controls.filter((element:any)=>{
            const valor=(element as FormGroup).controls["codCostCenterSecondary"].value;
            return valor==form.controls["codCostCenterSecondary"].value
        })[0];
        if(result) {
          const resultado = await this.modal.openModal("Esse centro de custo já está cadastrado",true); 
            if (resultado) {          
              this.cdr.detectChanges();
            }            
        }
        else {
          this.costCenterSecondaryForm.push(this.createCostCenterSecondaryForm(form.controls["codCostCenterSecondary"].value,form.controls["description"].value));
          form.controls["codCostCenterSecondary"].setValue('',{ emitEvent: false })
          form.controls["description"].setValue('',{ emitEvent: false })    
          this.moduloService.desativarValidadores(this.formulario?.controls["FormNewCostCenterSecondary"] as FormGroup);       
        }
      }    else {
        this.moduloService.ativarvalidadores(this.formulario?.controls["FormNewCostCenterSecondary"] as FormGroup);      
      } 
    }
  
    gravar() {      

      const formNewCostCenterSecondary=this.formulario?.controls["FormNewCostCenterSecondary"] as FormGroup
      this.moduloService.desabilitaCamposFormGroup(formNewCostCenterSecondary);     
      
        if (this.formulario?.invalid) {
          this.formulario.markAllAsTouched();
          return;
        }

      this.moduloService.habilitaCamposFormGroup(formNewCostCenterSecondary,['codCostCenterSecondary','description'])
        
        const formValues=this.formulario?.value;
        const objGravar: { 
          id?:string |null;
          codCostCenter: string;
          description: string;
          active:boolean;
          costCenterSecondary: any[]; // Definindo o tipo correto para o array 'perfil'    
          
        } ={
          id:null,
          codCostCenter:formValues.codCostCenter,
          description:formValues.description??'',       
          active:formValues.active,
          costCenterSecondary:[],           
        }     
        
        if(formValues.costCenterSecondary && formValues.costCenterSecondary.length) {       
          formValues.costCenterSecondary.forEach((element:any) => {       
            objGravar.costCenterSecondary.push({codCostCenterSecondary:element.codCostCenterSecondary, description:element.description})  
          });              
        }   
    
        if(this.idCostCenter) {
    
          objGravar.id=this.idCostCenter
            this.costCenterService.updateCostCenter(objGravar).pipe(
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
                  }
                  return throwError(() => error);
              })
            
            ).subscribe(()=>{})
        }  
        else {
    
          this.costCenterService.verifyExistsCostCenter({codDaily:objGravar.codCostCenter}).subscribe((async (response:any)=>{
            if(response.message) {              
                const resultado = await this.modal.openModal("Esse centro de custo já está cadastrado tente outro",true); 
                if (resultado) {
                
                }
            }
            else {
              
              this.costCenterService.addCostCenter(objGravar).pipe(
                catchError((error: HttpErrorResponse) => {   
                  if (error.status === 401) {
                    console.log('Interceptando requisição:', error.status);
                  }
                  return throwError(() => error);
                })
              ).subscribe(async () => {            
              
                // Aguarda o resultado do modal antes de continuar
                const resultado = await this.modal.openModal("Centro de custo cadastrado com sucesso",true);             
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
        this.router.navigate(['/aplicacao/costCenter']);
      }
  
      deleteCostCenterSecondary(index:number) {
        this.costCenterSecondaryForm.removeAt(index);
      }
}
