import { RouterModule, Routes } from '@angular/router';
import { CenterComponent } from './center/center.component';
import { NgModule } from '@angular/core';

import { AplicacaoComponent } from './aplicacao/aplicacao.component';
import { LoginComponent } from './login/login.component';
import { UsuarioComponent } from './modulos/ferramentaGestao/usuarios/usuario/usuario.component';

export const routes: Routes = [

    { path: '', redirectTo: '/aplicacao', pathMatch: 'full' },   // Redireciona para login por padrão    
    { 
        path:'aplicacao',
        component:AplicacaoComponent    ,
        children:[
            {
                path:'center',
                component:CenterComponent    ,
            },
            {
                path:'usuario',
                component:UsuarioComponent    ,
            }, 
           
        ]
    },   // Redireciona para login por padrão    
    { 
        path:'login',
        component:LoginComponent    
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }