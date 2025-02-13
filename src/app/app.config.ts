import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { ReactiveFormsModule } from '@angular/forms';



export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),  // Fornece o HttpClient para a aplicação
    HttpClientModule,
    ReactiveFormsModule,
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor]))
  
  ]
};
