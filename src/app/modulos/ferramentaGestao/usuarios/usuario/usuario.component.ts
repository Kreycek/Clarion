import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioService } from '../usuario.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalConfirmationComponent } from '../../../../modal/modal-confirmation/modal-confirmation.component';
import { PerfilService } from '../../perfil/perfil.service';


@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule,ModalConfirmationComponent ],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent {

  constructor(
    private router: Router, 
    private usuarioService: UsuarioService,
    private perfilService: PerfilService
  ) {}
  
 
  dados:any
  perfis:any

  isModalVisible = false;

  openModal() {
    this.isModalVisible = true;
  }

  handleConfirm() {
    console.log(this.ds);
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

   ds=0;
  
}
