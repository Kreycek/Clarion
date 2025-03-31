import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { BalanceteService } from '../../modulos/contabilidade/balancete/balancete.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-balancete-report',
  imports: [ CommonModule, FormsModule,],
  templateUrl: './balancete-report.component.html',
  styleUrl: './balancete-report.component.css'
})
export class BalanceteReportComponent {

  searchMonth: any = '';
  searchYear: any =  +new Date().getFullYear();

   constructor(
        public configService: ConfigService,
        public balanceteService:BalanceteService,
        private route: ActivatedRoute
        
      ) {}
    
     initialYear : any  | null = 0
     initialMonth : any  | null = 0
     endYear : any  | null = 0
     endMonth : any  | null = 0
     balacente:any[]=[];

    ngOnInit() {
      this.initialYear = this.route.snapshot.queryParamMap.get('initialYear');
      this.initialMonth= this.route.snapshot.queryParamMap.get('initialMonth');
      this.endYear= this.route.snapshot.queryParamMap.get('endYear');
      this.endMonth= this.route.snapshot.queryParamMap.get('endMonth');
    
      this.balanceteService.getBalanceteReport(this.initialYear,this.initialMonth,this.endYear,this.endMonth).subscribe((response)=>{
        console.log(response);
                

        let _class=''
        let totalDebit=0
        let totalCredit=0
        for(let i=0;i<=response.balancete.length; i++) {
          const line=response.balancete[i];
          // console.log('line',line.class);
          if(line) {
          if(!_class) {
            _class=line.class
          }
          else if(_class!=line?.class) {
            _class=line.class
            this.balacente.push(
              {
                codAccount:'',
                description:'Soma Liquida', 
                debitValue:totalDebit, 
                creditValue:totalCredit
              }
            )

            this.balacente.push(
              {
                codAccount:'',
                description:'Soma saldos', 
                debitValue:totalDebit, 
                creditValue:totalCredit
              }
            )


            totalDebit=0;
            totalCredit=0;
          }

          if(line.sum) {
            totalDebit+=line.debitValue
            totalCredit+=line.creditValue
          }

          this.balacente.push(line)
          
           if((response.balancete.length-1)==i) {
            this.balacente.push(
              {codAccount:'',description:'Soma Liquida', 
                debitValue:totalDebit, 
                creditValue:totalCredit})
            totalDebit=0;
            totalCredit=0;
          }

        }


        }
      })
    }
}
