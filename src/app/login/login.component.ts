import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from './login.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, HttpClientModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {


  constructor(private loginService: LoginService) {}

  username: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  
  onLogin() {
    const user = {
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.loginService.login(user).subscribe(
      (response) => {
        // Salva o token no localStorage após o login
        const token = response.token;
        localStorage.setItem('token', token);

        // Valida o token após o login
        this.loginService.validateTokenAfterLogin(token).subscribe(
          (validationResponse) => {
            console.log('Token válido:', validationResponse);
          },
          (error) => {
            console.error('Erro ao validar o token:', error);
          }
        );
      },
      (error) => {
        this.errorMessage = error.error || 'Erro ao fazer login!';
      }
    );
  }
}
  


