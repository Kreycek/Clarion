import { RouterModule, Routes } from '@angular/router';
import { CenterComponent } from './center/center.component';
import { NgModule } from '@angular/core';

import { AplicacaoComponent } from './aplicacao/aplicacao.component';
import { LoginComponent } from './login/login.component';
import { UsuarioComponent } from './modulos/ferramentaGestao/usuarios/usuario/usuario.component';
import { AddUsuarioComponent } from './modulos/ferramentaGestao/usuarios/add-usuario/add-usuario.component';
import { ChartOfAccountsComponent } from './modulos/contabilidade/chart-of-accounts/chart-of-accounts.component';
import { AddChartOfAccountsComponent } from './modulos/contabilidade/add-chart-of-accounts/add-chart-of-accounts.component';
import { DailyComponent } from './modulos/ferramentaGestao/daily/daily.component';

export const routes: Routes = [

    { path: '', redirectTo: '/aplicacao', pathMatch: 'full' },   // Redireciona para login por padrão    
    { 
        path:'aplicacao',
        component:AplicacaoComponent,
        children:[
            {
                path:'center',
                component:CenterComponent,
            },
            {
                path:'usuario',
                component:UsuarioComponent,
            }, 
            {
                path:'addUser/:id',
                component:AddUsuarioComponent
            }   , 
            {
                path:'addUser',
                component:AddUsuarioComponent
            },
            {
                path:'chartOfAccount',
                component:ChartOfAccountsComponent
            },
            {
                path:'addChartOfAccount',
                component:AddChartOfAccountsComponent
            }, 
            {
                path:'addChartOfAccount/:id',
                component:AddChartOfAccountsComponent
            }  , 
            {
                path:'daily/:id',
                component:DailyComponent
            } , 
            {
                path:'daily',
                component:DailyComponent
            }

            
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