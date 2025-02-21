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

    isVisibleValidationCodDocumento=false;
    isVisibleValidationDescription=false;

    isVisibleValidationCodCountryPhone=false;
    isVisibleValidationCodStatePhone=false;
    isVisibleValidationPhoneNumberPhone=false;

    isVisibleValidationYearExecise=false;
    isVisibleValidationStartMonthExercise=false;
    isVisibleValidationEndMonthExercise=false;
     
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
          this.documentForm.push(this.createDocumentForm(
            form.controls["codDocument"].value,
            form.controls["description"].value,
            form.controls["codPostal"].value,
            form.controls["country"].value,         
            form.controls["city"].value,
            form.controls["address"].value,
            form.controls["addressNumber"].value,
            form.controls["addressComplement"].value));

          form.controls["codDocument"].setValue('',{ emitEvent: false })
          form.controls["description"].setValue('',{ emitEvent: false })
          form.controls["codPostal"].setValue('',{ emitEvent: false })
          form.controls["country"].setValue('',{ emitEvent: false })
          form.controls["city"].setValue('',{ emitEvent: false })
          form.controls["address"].setValue('',{ emitEvent: false })
          form.controls["addressNumber"].setValue('',{ emitEvent: false })
          form.controls["addressComplement"].setValue('',{ emitEvent: false })
         
          
          this.moduloService.desativarValidadores(this.formulario?.controls["FormNewDocuments"] as FormGroup)

        }      
      } else {
        console.log('tste',this.formulario?.controls["FormNewDocuments"] as FormGroup);      
        this.moduloService.ativarvalidadores(this.formulario?.controls["FormNewDocuments"] as FormGroup);       
      } 
      
    }

    get documentForm() {
      return (this.formulario?.get('documents') as FormArray);
    }

    createDocumentForm(
      codDocument:string, 
      description:string, 
      codPostal:string, 
      country:string, 
      city:string, 
      address:string, 
      addressNumber:string, 
      addressComplement:string
      ): FormGroup {
      return this.fb.group({  
        codDocument: [codDocument],
        description: [description]  ,
        codPostal: [codPostal],
        country: [country],
        city: [city],
        address: [address],
        addressNumber: [addressNumber],
        addressComplement: [addressComplement]       
      });
    }
    
    
    async addPhone() {

      console.log('Phones',this.formulario?.controls["FormNewPhones"]);

      if(this.formulario?.controls["FormNewPhones"].valid) {
       
        const form = this.formulario?.controls["FormNewPhones"] as FormGroup;
        console.log();
        const codCountry=form.controls["codCountry"].value;
        const codeState=form.controls["codState"].value;
        const phoneNumber=form.controls["phoneNumber"].value;

        const result = this.phoneForm.controls.filter((element:any)=>{           
            const _codCountry=(element as FormGroup).controls["codState"].value;
            const _codeState=(element as FormGroup).controls["codCountry"].value;
            const _phoneNumber=(element as FormGroup).controls["phoneNumber"].value;
            return codCountry==_codCountry && codeState==_codeState && phoneNumber==_phoneNumber
        })[0];
        if(result) {
          const resultado = await this.modal.openModal("Esse telefone já está cadastrado para essa empresa",true); 
            if (resultado) {          
              this.cdr.detectChanges();
            }
        }
        else {
          this.phoneForm.push(this.createPhoneForm(codCountry,codeState,phoneNumber));
          form.controls["codCountry"].setValue('',{ emitEvent: false })
          form.controls["codState"].setValue('',{ emitEvent: false })
          form.controls["phoneNumber"].setValue('',{ emitEvent: false })

          this.moduloService.desativarValidadores(this.formulario?.controls["FormNewPhones"] as FormGroup)

       
        } 
            
      } else {
        console.log('tste',this.formulario?.controls["FormNewPhones"] as FormGroup);      
        this.moduloService.ativarvalidadores(this.formulario?.controls["FormNewPhones"] as FormGroup);       
      } 
      
    }

    get phoneForm() {
      return (this.formulario?.get('phone') as FormArray);
    }


    createPhoneForm(codCountry:string, codState:string, phoneNumber:String): FormGroup {
      return this.fb.group({  
        codCountry: [codCountry],
        codState: [codState],
        phoneNumber: [phoneNumber, Validators.required]        
      });
    }
    
    async addExercise() {
      

      if(this.formulario?.controls["FormNewExercise"].valid) {
        const form = this.formulario?.controls["FormNewExercise"] as FormGroup;
       
        const year=form.controls["year"].value;
        console.log('year 1',year);
        const startMonth=form.controls["startMonth"].value;
        const endMonth=form.controls["endMonth"].value;

        const result = this.exerciseForm.controls.filter((element:any)=>{          
            const _year=(element as FormGroup).controls["year"].value;        
           
            return year===_year;
        })[0];

        console.log('year 2',result);

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
        console.log('tste',this.formulario?.controls["FormNewExercise"] as FormGroup);      
        this.moduloService.ativarvalidadores(this.formulario?.controls["FormNewExercise"] as FormGroup);       
      }      
    }

 
   

    get exerciseForm() {
      return (this.formulario?.get('exercise') as FormArray);
    }


    createExerciseForm(year:string, startMonth:string, endMonth:String): FormGroup {
      return this.fb.group({  
        year: [year],
        startMonth: [startMonth],
        endMonth: [endMonth]        
      });
    }

     createForm(obj:any) {

      obj.Country=!obj.Country ? 'Portugal' : obj.Country
      console.log('obj.Country',obj.Country);
      this.formulario = this.fb.group({
        active: [obj.Active, Validators.required],
        codCompany: [obj.CodCompany, Validators.required],
        name: [obj.Description, Validators.required],
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
        vATRegime: [obj.VATRegime],
        email: [obj.Email],
        webSite: [obj.WebSite],
        adress: [obj.Address],
        documents: this.fb.array([] ),
        phone: this.fb.array([] ),
        exercise: this.fb.array([] ),
        FormNewDocuments: new FormGroup({  // Subformulário dentro do formulário principal
          codDocument: new FormControl('',[Validators.required]),
          description: new FormControl('',[Validators.required]),
          country:new FormControl('Angola',[Validators.required]),
          codPostal:new FormControl(''),
          city:new FormControl(''),
          address:new FormControl('',[Validators.required]),
          addressNumber:new FormControl(''),
          addressComplement:new FormControl(''),
        }),
        FormNewPhones: new FormGroup({  // Subformulário dentro do formulário principal
          codCountry: new FormControl('244',[Validators.required]),
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
      


  ngOnInit() {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');  // Substitua 'id' pelo nome do parâmetro

        if(id) {
          this.isEdit=true;
          this.companyService.getCompanyById(id??'0').subscribe((response)=>{       
            console.log('dailys',response);
            this.idCompany=id;    
            this.createForm(response);  

            if(response.Documents && response.Documents.length>0) {
              response.Documents.forEach((element:any) => {
                console.log('element',element);
                this.documentForm.push(this.createDocumentForm(
                  element.codDocument,
                  element.description,
                  element.codPostal,
                  element.country,
                  element.city,
                  element.address,
                  element.addressNumber,
                  element.addressComplement
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
    const ds=objItem as FormGroup;


    return        ds.controls['description'].value + '-' + 
                  ds.controls['codDocument'].value +           
                  (ds.controls['country'].value ? ' /  ' + 'País: ' + ds.controls['country'].value : '') + 
                  (ds.controls['city'].value ? ' / Cidade: ' + ds.controls['city'].value : '')+ 
                   ' Logradouro: ' + ds.controls['address'].value+ ','  + ds.controls['codPostal'].value+ ',' +  
                    ds.controls['addressNumber'].value+ ', '+ 
                   ds.controls['addressComplement'].value  ;


  }

  async gravar() {      

   const formDocumentsInsert=this.formulario?.controls["FormNewDocuments"] as FormGroup
   const formPonesInsert=this.formulario?.controls["FormNewPhones"] as FormGroup
   const formExercideInsert=this.formulario?.controls["FormNewExercise"] as FormGroup
    
   this.moduloService.desabilitaCamposFormGroup(formDocumentsInsert);
   this.moduloService.desabilitaCamposFormGroup(formPonesInsert);
   this.moduloService.desabilitaCamposFormGroup(formExercideInsert);

       console.log('Passou',this.formulario);

      if (this.formulario?.invalid) {
        const resultado = await this.modal.openModal("Existem campos por prencher no formulário, corrija",true); 
        if (resultado) {
        
        }
        this.formulario.markAllAsTouched();
        return;
      }

    this.moduloService.habilitaCamposFormGroup(formDocumentsInsert,['codDocument','description','cae'])
    this.moduloService.habilitaCamposFormGroup(formPonesInsert,['codCountry','codState','phoneNumber'])
    this.moduloService.habilitaCamposFormGroup(formExercideInsert,['codDocument','description','address'])

      console.log('Passou 2');

      return false;
      
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
  
        this.companyService.verifyExistsCompany({codDaily:objGravar.codDaily}).subscribe((async (response:any)=>{
          if(response.message) {              
              const resultado = await this.modal.openModal("Esse código de empresa já está cadastrado tente outro",true); 
              if (resultado) {
              
              }
          }
          else {
            
            this.companyService.addCompany(objGravar).pipe(
              catchError((error: HttpErrorResponse) => {   
                if (error.status === 401) {
                  console.log('Interceptando requisição:', error.status);
                }
                return throwError(() => error);
              })
            ).subscribe(async () => {            
            
              // Aguarda o resultado do modal antes de continuar
              const resultado = await this.modal.openModal("Empresa cadastrada com sucesso",true);             
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

    deletePhone(index:number) {
      this.phoneForm.removeAt(index);
    }
    deleteExercise(index:number) {
      this.exerciseForm.removeAt(index);
    }

}
