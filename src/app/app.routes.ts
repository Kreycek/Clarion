import { RouterModule, Routes } from '@angular/router';
import { CenterComponent } from './center/center.component';
import { NgModule } from '@angular/core';

import { AplicacaoComponent } from './aplicacao/aplicacao.component';
import { LoginComponent } from './login/login.component';
import { UsuarioComponent } from './modulos/ferramentaGestao/users/usuario/usuario.component';
import { AddUsuarioComponent } from './modulos/ferramentaGestao/users/add-usuario/add-usuario.component';
import { ChartOfAccountsComponent } from './modulos/contabilidade/chartOfAccount/chart-of-accounts/chart-of-accounts.component';
import { AddChartOfAccountsComponent } from './modulos/contabilidade/chartOfAccount/add-chart-of-accounts/add-chart-of-accounts.component';
import { DailyComponent } from './modulos/ferramentaGestao/daily/daily/daily.component';
import { AddDailyComponent } from './modulos/ferramentaGestao/daily/add-daily/add-daily.component';
import { CompanyComponent } from './modulos/ferramentaGestao/company/company/company.component';
import { AddCompanyComponent } from './modulos/ferramentaGestao/company/add-company/add-company.component';
import { MovimentComponent } from './modulos/contabilidade/movement/movement/moviment.component';
import { AddMovimentComponent } from './modulos/contabilidade/movement/addMovement/add-moviment.component';
import { CostCenterComponent } from './modulos/ferramentaGestao/costCenter/cost-center/cost-center.component';
import { AddCostCenterComponent } from './modulos/ferramentaGestao/costCenter/add-cost-center/add-cost-center.component';
import { BalanceteReportComponent } from './reports/balancete-report/balancete-report.component';
import { BalanceteComponent } from './modulos/contabilidade/balancete/balancete.component';

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
            }, 
            {
                path:'addDaily/:id',
                component:AddDailyComponent
            } , 
            {
                path:'addDaily',
                component:AddDailyComponent
            }, 
            {
                path:'company',
                component:CompanyComponent
            }, 
            {
                path:'addCompany/:id',
                component:AddCompanyComponent
            } , 
            {
                path:'addCompany',
                component:AddCompanyComponent
            }, 
            {
                path:'movement',
                component:MovimentComponent
            }, 
            {
                path:'addMovement/:id',
                component:AddMovimentComponent
            } , 
            {
                path:'addMovement',
                component:AddMovimentComponent
            }, 
            {
                path:'costCenter',
                component:CostCenterComponent
            }, 
            {
                path:'addCostCenter/:id',
                component:AddCostCenterComponent
            } , 
            {
                path:'addCostCenter',
                component:AddCostCenterComponent
            }, 
            {
                path:'balancete',
                component:BalanceteComponent
            }

            
        ]
    },   // Redireciona para login por padrão    
    { 
        path:'login',
        component:LoginComponent    
    }
    ,   // Redireciona para login por padrão    
    { 
        path:'balanceteReport',
        component:BalanceteReportComponent    
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }