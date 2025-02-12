import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';



export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),  // Fornece o HttpClient para a aplicação
    HttpClientModule,
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor]))
  
  ]
};
