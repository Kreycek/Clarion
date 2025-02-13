import { Component } from '@angular/core';
import { PerfilService } from '../../perfil/perfil.service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../usuario.service';
import { catchError, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-add-usuario',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule ],
  templateUrl: './add-usuario.component.html',
  styleUrl: './add-usuario.component.css'
})
export class AddUsuarioComponent {

  
 
  formulario: FormGroup| null = null; 
  constructor(
    private perfilService: PerfilService,
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {
    
  }

  
  ngOnInit() {

    this.perfilService.gePerfil().subscribe((perfis:any)=>{

     
      const _perfilForm = this.formulario?.get('perfis') as FormArray;
      perfis.forEach((element:any) => {       
        _perfilForm.push(this.criarPerfil(element.ID,element.name, false));
      });   
       
    })

    this.formulario = this.fb.group({
      nome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      passaporte: ['', Validators.required],
      perfis: this.fb.array([], Validators.required),  // Array para perfis selecionados
      // documentos: this.fb.array([this.criarDocumento()])  // Começa com um documento
    }); 
    
  }

  // get documentosForm() {
  //   return (this.formulario?.get('documentos') as FormArray);
  // }

  get perfisForm() {
    return (this.formulario?.get('perfis') as FormArray);
  }

  criarPerfil(id:string, name:string, value:boolean): FormGroup {
    return this.fb.group({
      id: [id],
      name: [name],
      value: [value]
    });
  }


  // criarDocumento(): FormGroup {
  //   return this.fb.group({
  //     documento: ['', Validators.required],
  //     descricao: ['', Validators.required]
  //   });
  // }

  // Adicionar novo documento
  // adicionarDocumento(): void {
  //   const documentos = this.formulario?.get('documentos') as FormArray;
  //   documentos.push(this.criarDocumento());
  // }


  // onPerfilChange(e: any, perfil: string) {
  //   const perfisArray = this.formulario?.get('perfis') as FormArray;

  //   if (e.target.checked) {
  //     perfisArray.push(this.fb.control(perfil));  // Adiciona o perfil selecionado
  //   } else {
  //     const index = perfisArray.controls.findIndex(x => x.value === perfil);
  //     if (index !== -1) {
  //       perfisArray.removeAt(index);  // Remove o perfil desmarcado
  //     }
  //   }
  // }

  gravar() {


    const formValues=this.formulario?.value;
    const objGravar: { 
      id?:string |null;
      name: string;
      lastName: string;
      email: string;
      passportNumber: string;
      perfil: number[]; // Definindo o tipo correto para o array 'perfil'
     
      password:string
    } ={
      id:null,
      name:formValues.nome,
      lastName:formValues.sobrenome,
      email:formValues.email,
      passportNumber:formValues.passaporte,
      perfil:[],
      
      password:'$2a$10$.3BNGTrYkITOuIf7fKor0u1mUgskkHhOSEhz1EmAVv6hZ.Fq9W76S'
    }
    objGravar.perfil=[];

    console.log('formValues',formValues);
    if(formValues.perfis && formValues.perfis.length) {
      formValues.perfis.forEach((element:any) => {
        console.log('element',element);
        if(element.name=='Administrador')
        objGravar.perfil.push(1)
      else  if(element.name=='Super Administrador') {
        objGravar.perfil.push(2)
      }
      else  if(element.name=='Utilizador') {
        objGravar.perfil.push(3)
      }
      });
    }
    this.usuarioService.addUsers(objGravar).pipe(

    tap(() => console.log('Interceptando requisição:')),
    catchError((error: HttpErrorResponse) => {
         
           if (error.status === 401) {
               console.log('Interceptando requisição:', error.status)
               // router.navigate(['/login']); // Redireciona para a página de login
             }
         return throwError(() => error);
       })
    
    ).subscribe(()=>{})
  }

}
