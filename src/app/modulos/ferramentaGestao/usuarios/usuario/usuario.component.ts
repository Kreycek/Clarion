import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioService } from '../usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule ],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent {

  constructor(private http: HttpClient, private usuarioService: UsuarioService) {}
  
  private apiUrl = 'http://localhost:8080/users';  // URL do seu backend para login
  dados:any

   ngOnInit() {
    this.usuarioService.getUsers().subscribe((response:any)=>{

      this.dados=response;
        console.log('users',response);
    })
   }
  
}
