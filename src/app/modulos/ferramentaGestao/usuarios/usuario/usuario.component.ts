import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioService } from '../usuario.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalConfirmationComponent } from '../../../../modal/modal-confirmation/modal-confirmation.component';
import { PerfilService } from '../../perfil/perfil.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule,ModalConfirmationComponent,FormsModule ],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent {

  constructor(
    private router: Router, 
    private usuarioService: UsuarioService,
    private perfilService: PerfilService
  ) {}
  
  searchName: string = '';
  searchEmail: string = '';
  searchRole: string = '';

  filteredUsers = []; // Inicialmente, exibe todos os usuários

  searchUsers() {

    console.log('searchName',this.searchName);
    console.log('searchName',this.searchEmail);
    console.log('searchName',this.searchRole);
    // this.usuarioService.searchUsers().subscribe((response:any)=>{

    //   this.dados=response;
    //     console.log('users',response);
    // })

    let objPesquisar: { 
      name: string;
      email: string;      
      perfil: number[]; // Definindo o tipo correto para o array 'perfil'
    }

    objPesquisar= { 
      name: this.searchName, 
      email: this.searchEmail, 
      perfil: [] 
    };

    if(this.searchRole=='Administrador')
      objPesquisar.perfil.push(1)
    else  if(this.searchRole=='Super Administrador') {
      objPesquisar.perfil.push(2)
    }
    else  if(this.searchRole=='Utilizador') {
      objPesquisar.perfil.push(3)
    }

    this.usuarioService.searchUsers(objPesquisar).subscribe((response:any)=>{

      this.dados=response;
        console.log('users',response);
    })

  }
 
  dados:any
  perfis:any

  isModalVisible = false;

  openModal() {
    this.isModalVisible = true;
  }

  handleConfirm() {
   
    console.log('Confirmado!');
    this.isModalVisible = false;
  }

  handleCancel() {
    console.log('Cancelado!');
    this.isModalVisible = false;
  }

  teste($event:any) {
    console.log('$event',$event);
  }

   ngOnInit() {
    this.perfilService.gePerfil().subscribe((response:any)=>{

      this.perfis=response;
        console.log('perfis',response);
    })

    
    this.usuarioService.getUsers().subscribe((response:any)=>{

      this.dados=response;
        console.log('users',response);
    })
   }

   addUser() {
    this.router.navigate(['/aplicacao/addUser']);
   }

   updateUser(id:string) {
    this.router.navigate(['/aplicacao/addUser', id]);
   
   } 
  
}
