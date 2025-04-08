import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalOkComponent } from '../../../../modal/modal-ok/modal-ok.component';
import { catchError, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../../../services/config.service';
import { CompanyService } from '../company.service';
import { ModuloService } from '../../../modulo.service';

@Component({
  selector: 'app-add-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalOkComponent, FormsModule],
  templateUrl: './add-company.component.html',
  styleUrl: './add-company.component.css'
})
export class AddCompanyComponent {
 @ViewChild(ModalOkComponent) modal!: ModalOkComponent;  

    documentMiniFormCod:string=''
    documentMiniFormDescription:string=''

     
    isEdit=false;
    idCompany:string |null = null 
    formulario: FormGroup| null = null;
    years:number[]=[]
    currentYear: number = new Date().getFullYear();

     constructor(     
         private fb: FormBuilder,
         private companyService:CompanyService,
         private route: ActivatedRoute,
         private router: Router, 
         public configService:ConfigService,
         private cdr: ChangeDetectorRef,
         public moduloService:ModuloService
     ) {} 

     

     async addDocument() {
     
      if(this.formulario?.controls["FormNewDocuments"].valid) {
        const form = this.formulario?.controls["FormNewDocuments"] as FormGroup;
        const result = this.documentForm.controls.filter((element:any)=>{
            let valor=(element as FormGroup).controls["documentNumber"].value;
          
            return valor==form.controls["documentNumber"].value.trim()
        })[0];
        if(result) {
          const resultado = await this.modal.openModal("Essa documento já está cadastrado para esse diário",true); 
            if (resultado) {          
              this.cdr.detectChanges();
            }
        }
        else {
          this.documentForm.push(this.createDocumentForm(
            form.controls["documentNumber"].value,
            form.controls["nameDocument"].value,
            form.controls["codPostal"].value,
            form.controls["country"].value,         
            form.controls["city"].value,
            form.controls["address"].value,
            form.controls["addressNumber"].value,
            form.controls["addressComplement"].value));

          form.controls["documentNumber"].setValue('',{ emitEvent: false })
          form.controls["nameDocument"].setValue('',{ emitEvent: false })
          form.controls["codPostal"].setValue('',{ emitEvent: false })
          form.controls["country"].setValue(this.configService.nameCountryStandard,{ emitEvent: false })
          form.controls["city"].setValue('',{ emitEvent: false })
          form.controls["address"].setValue('',{ emitEvent: false })
          form.controls["addressNumber"].setValue('',{ emitEvent: false })
          form.controls["addressComplement"].setValue('',{ emitEvent: false })
         
          
          this.moduloService.desativarValidadores(this.formulario?.controls["FormNewDocuments"] as FormGroup)

        }      
      } else {
   
        this.moduloService.ativarvalidadores(this.formulario?.controls["FormNewDocuments"] as FormGroup);       
      } 
      
    }

    get documentForm() {
      return (this.formulario?.get('documents') as FormArray);
    }

    createDocumentForm(
      documentNumber:string, 
      nameDocument:string, 
      codPostal:string, 
      country:string, 
      city:string, 
      address:string, 
      addressNumber:string, 
      addressComplement:string
      ): FormGroup {
      return this.fb.group({  
        documentNumber: [documentNumber??null],
        nameDocument: [nameDocument??null]  ,
        codPostal: [codPostal??null],
        country: [country??null],
        city: [city??null],
        address: [address??null],
        addressNumber: [addressNumber??null],
        addressComplement: [addressComplement??null]       
      });
    }
    
    
    async addPhone() {



      if(this.formulario?.controls["FormNewPhones"].valid) {
       
        const form = this.formulario?.controls["FormNewPhones"] as FormGroup;
   
        const codCountry=form.controls["codCountry"].value;
        const codeState=form.controls["codState"].value;
        const phoneNumber=form.controls["phoneNumber"].value;

        const result = this.phoneForm.controls.filter((element:any)=>{           
            const _codCountry=+(element as FormGroup).controls["codState"].value;
            const _codeState=(element as FormGroup).controls["codCountry"].value;
            const _phoneNumber=(element as FormGroup).controls["phoneNumber"].value;
            return codCountry===_codCountry && codeState===_codeState && phoneNumber===_phoneNumber
        })[0];
        if(result) {
          const resultado = await this.modal.openModal("Esse telefone já está cadastrado para essa empresa",true); 
            if (resultado) {          
              this.cdr.detectChanges();
            }
        }
        else {
          this.phoneForm.push(this.createPhoneForm(codCountry,codeState,phoneNumber));
          form.controls["codCountry"].setValue(this.configService.codCountryStandard,{ emitEvent: false })
          form.controls["codState"].setValue('',{ emitEvent: false })
          form.controls["phoneNumber"].setValue('',{ emitEvent: false })

          this.moduloService.desativarValidadores(this.formulario?.controls["FormNewPhones"] as FormGroup)

       
        } 
            
      } else {
          
        this.moduloService.ativarvalidadores(this.formulario?.controls["FormNewPhones"] as FormGroup);       
      } 
      
    }

    get phoneForm() {
      return (this.formulario?.get('phone') as FormArray);
    }


    createPhoneForm(codCountry:string, codState:string, phoneNumber:String): FormGroup {
      return this.fb.group({  
        codCountry: [codCountry.toString()??null],
        codState: [codState??null],
        phoneNumber: [phoneNumber??null, Validators.required]        
      });
    }
    
    async addExercise() {
      

      if(this.formulario?.controls["FormNewExercise"].valid) {
        const form = this.formulario?.controls["FormNewExercise"] as FormGroup;
       
        const year=+form.controls["year"].value;
    
        const startMonth=form.controls["startMonth"].value;
        const endMonth=form.controls["endMonth"].value;

        const result = this.exerciseForm.controls.filter((element:any)=>{          
            const _year=(element as FormGroup).controls["year"].value;           
            return year===_year;
        })[0];

       

        if(result) {
          const resultado = await this.modal.openModal("Esse ano já está configurado para essa empresa",true); 
            if (resultado) {          
              this.cdr.detectChanges();
            }
        }
        else {
          this.exerciseForm.push(this.createExerciseForm(year,startMonth,endMonth));
          form.controls["year"].setValue(this.configService.currentYear,{ emitEvent: false })
          form.controls["startMonth"].setValue('1',{ emitEvent: false })
          form.controls["endMonth"].setValue('12',{ emitEvent: false })
          this.moduloService.desativarValidadores(this.formulario?.controls["FormNewExercise"] as FormGroup)
        
        }      
      } else {
      
        this.moduloService.ativarvalidadores(this.formulario?.controls["FormNewExercise"] as FormGroup);       
      }      
    }

    get exerciseForm() {
      return (this.formulario?.get('exercise') as FormArray);
    }

    createExerciseForm(year:number, startMonth:string, endMonth:String): FormGroup {
      return this.fb.group({  
        year: [year??null],
        startMonth: [startMonth??null],
        endMonth: [endMonth??null]        
      });
    }

     createForm(obj:any) {

      obj.Country=!obj.Country ? this.configService.nameCountryStandard : obj.Country
     
      this.formulario = this.fb.group({
        active: [obj.Active, Validators.required],
        codCompany: [obj.CodCompany, Validators.required],
        name: [obj.Name, Validators.required],
        cae: [obj.CAE, Validators.required],
        mainActivity: [obj.MainActivity],
        otherActivities: [obj.OtherActivities],
        legalNature: [obj.LegalNature],
        socialCapital: [obj.SocialCapital],
        nationalCapital: [obj.NationalCapital],
        extraCapital: [obj.ExtraCapital],
        publicCapital: [obj.PublicCapital],
        country: [obj.Country],
        city: [obj.City],
        vATRegime: [obj.VATRegime??'Mensal'],
        email: [obj.Email],
        webSite: [obj.WebSite],       
        documents: this.fb.array([] ),
        phone: this.fb.array([] ),
        exercise: this.fb.array([] ),
        FormNewDocuments: new FormGroup({  // Subformulário dentro do formulário principal
          documentNumber: new FormControl('',[Validators.required]),
          nameDocument: new FormControl('',[Validators.required]),
          country:new FormControl(this.configService.nameCountryStandard,[Validators.required]),
          codPostal:new FormControl(''),
          city:new FormControl(''),
          address:new FormControl('',[Validators.required]),
          addressNumber:new FormControl(''),
          addressComplement:new FormControl(''),
        }),
        FormNewPhones: new FormGroup({  // Subformulário dentro do formulário principal
          codCountry: new FormControl(this.configService.codCountryStandard,[Validators.required]),
          codState: new FormControl(''),
          phoneNumber: new FormControl('',[Validators.required])
        }),
        FormNewExercise: new FormGroup({  // Subformulário dentro do formulário principal
          year: new FormControl(this.configService.currentYear,[Validators.required]),
          startMonth: new FormControl('1',[Validators.required]),
          endMonth: new FormControl('12',[Validators.required])
        })
      }); 

      this.formulario.get('FormNewDocuments.codDocument')?.valueChanges.subscribe(value => {

        if(value) {
         
        }
        else {
         
        }
      });
  
      // Para monitorar todos os campos dentro de FormNewDocuments
      this.formulario.get('FormNewDocuments.description')?.valueChanges.subscribe(value => {

        if(value) {
         
        }
        else {
          
        }

      });

  }
      


  ngOnInit() {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');  // Substitua 'id' pelo nome do parâmetro

        if(id) {
          this.isEdit=true;
          this.companyService.getCompanyById(id??'0').subscribe((response)=>{       
      
            this.idCompany=id;    
            this.createForm(response);  

            if(response.Documents && response.Documents.length>0) {
              response.Documents.forEach((element:any) => {
         
                this.documentForm.push(this.createDocumentForm(
                  element.documentNumber,
                  element.nameDocument,
                  element.codPostal,
                  element.country,
                  element.city,
                  element.address,
                  element.addressNumber,
                  element.addressComplement
                ));
              });
            }

            if(response.Phone && response.Phone.length>0) {
              response.Phone.forEach((element:any) => {
              
                this.phoneForm.push(this.createPhoneForm(
                  element.codCountry,
                  element.codState,
                  element.phoneNumber
              
                ));
              });
            }

            if(response.Exercise && response.Exercise.length>0) {
              response.Exercise.forEach((element:any) => {
              
                this.exerciseForm.push(this.createExerciseForm(
                  element.year,
                  element.startMonth,
                  element.endMonth

              
                ));
              });
            }
          })
        }
        else {
          this.isEdit=false;
          this.createForm({Active:true});   
        }
      
      });    
  }

    
  formataEndereco(objItem:any) : string {

    const formatedAddress=objItem as FormGroup;

    return        formatedAddress.controls['nameDocument'].value + '-' + 
                   formatedAddress.controls['documentNumber'].value +           
                  (formatedAddress.controls['country'].value ? ' /  ' + 'País: ' + formatedAddress.controls['country'].value : '') + 
                  (formatedAddress.controls['city'].value ? ' / Cidade: ' + formatedAddress.controls['city'].value : '')+ 
                   ' / Logradouro: ' + formatedAddress.controls['address'].value+ ','  + formatedAddress.controls['codPostal'].value+ ',' +  
                   formatedAddress.controls['addressNumber'].value+ ', '+ 
                   formatedAddress.controls['addressComplement'].value  ;
  }

  async gravar() {      

   const formDocumentsInsert=this.formulario?.controls["FormNewDocuments"] as FormGroup
   const formPonesInsert=this.formulario?.controls["FormNewPhones"] as FormGroup
   const formExercideInsert=this.formulario?.controls["FormNewExercise"] as FormGroup
    
   this.moduloService.desabilitaCamposFormGroup(formDocumentsInsert);
   this.moduloService.desabilitaCamposFormGroup(formPonesInsert);
   this.moduloService.desabilitaCamposFormGroup(formExercideInsert);

      

      if (this.formulario?.invalid) {
        const resultado = await this.modal.openModal("Existem campos por prencher no formulário, corrija",true); 
        if (resultado) {
        
        }
        this.formulario.markAllAsTouched();
        return;
      }



    this.moduloService.habilitaCamposFormGroup(formDocumentsInsert,['documentNumber','nameDocument','address'])
    this.moduloService.habilitaCamposFormGroup(formPonesInsert,['codCountry','codState','phoneNumber'])
    this.moduloService.habilitaCamposFormGroup(formExercideInsert,['codDocument','description','address'])      
      
      const formValues=this.formulario?.value;

        const objGravar: { 
        id?:string |null;
        active:boolean;
        codCompany: string;
        name: string;
        cae:string;
        documents:any[];
        mainActivity:string;
        otherActivities:string;
        legalNature:string;
        socialCapital:string;
        nationalCapital:string;
        extraCapital:string;
        publicCapital:string;
        vatRegime:string;
        email:string;
        webSite:string;
        phone:any[];
        exercise:any[];

      }   ={
        id:null,
        active:formValues.active,       
        codCompany:formValues.codCompany,
        name:formValues.name,
        cae:formValues.cae,
        documents:formValues.documents,
        mainActivity:formValues.mainActivity,
        otherActivities:formValues.otherActivities,
        legalNature:formValues.legalNature,
        socialCapital:formValues.socialCapital,
        nationalCapital:formValues.nationalCapital,
        extraCapital:formValues.extraCapital,
        publicCapital:formValues.publicCapital,
        vatRegime:formValues.vATRegime,
        email:formValues.email,
        webSite:formValues.webSite,
        phone:formValues.phone,
        exercise:formValues.exercise,

      }

      if(this.idCompany) {
  
        objGravar.id=this.idCompany
          this.companyService.updateCompany(objGravar).pipe(
          tap(async (response:any) =>    {    
          
            const resultado = await this.modal.openModal(response.message,true); 
            if (resultado) {
  
            }  
          }),
          catchError(async (error: HttpErrorResponse) => {
              
                if (error.status === 500) {
                                 
                  const resultado = await this.modal.openModal(error.message,true); 
                  if (resultado) {
  
                  }                  
                }  
                if (error.status === 401) {
                    
                    // router.navigate(['/login']); // Redireciona para a página de login
                }
                return throwError(() => error);
            })
          
          ).subscribe(()=>{})
      }  
      else {
  
        this.companyService.verifyExistsCompany({codCompany:objGravar.codCompany}).subscribe((async (response:any)=>{
          if(response.message) {              
              const resultado = await this.modal.openModal("Esse código de empresa já está cadastrado tente outro",true); 
              if (resultado) {
              
              }
          }
          else {
            
            this.companyService.addCompany(objGravar).pipe(
              catchError((error: HttpErrorResponse) => {   
                if (error.status === 401) {
                  ;
                }
                return throwError(() => error);
              })
            ).subscribe(async () => {            
            
              // Aguarda o resultado do modal antes de continuar
              const resultado = await this.modal.openModal("Empresa cadastrada com sucesso",true);             
              if (resultado) {
       
                // Insira aqui a lógica para continuar após a confirmação
              } else {
                
              }
            });
            
            }
        }))
  
      
        }       
    }         
         
    cancel() {
      this.router.navigate(['/aplicacao/company']);
    }

    deleteDocument(index:number) {
      this.documentForm.removeAt(index);
    }

    deletePhone(index:number) {
      this.phoneForm.removeAt(index);
    }
    deleteExercise(index:number) {
      this.exerciseForm.removeAt(index);
    }

}
