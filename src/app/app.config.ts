import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY', // Formato para parsing da data (entrada)
  },
  display: {
    dateInput: 'DD/MM/YYYY', // Formato para exibição no campo de input
    monthYearLabel: 'MM/YYYY', // Formato para exibir mês e ano
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM/YYYY',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),  // Fornece o HttpClient para a aplicação
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    provideRouter(routes),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }, // Configurando o formato de data customizado
  
    provideHttpClient(withInterceptors([AuthInterceptor]))
  
  ]
};
