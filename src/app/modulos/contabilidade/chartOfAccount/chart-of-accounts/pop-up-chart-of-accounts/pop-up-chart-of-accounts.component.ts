import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { ChartOfAccountsComponent } from "../chart-of-accounts.component";
import { RouterModule } from '@angular/router';
import { AddChartOfAccountsComponent } from "../../add-chart-of-accounts/add-chart-of-accounts.component";
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pop-up-chart-of-accounts',
  imports: [MatDialogModule, ChartOfAccountsComponent, RouterModule, AddChartOfAccountsComponent,CommonModule],
  templateUrl: './pop-up-chart-of-accounts.component.html',
  styleUrl: './pop-up-chart-of-accounts.component.css'
})
export class PopUpChartOfAccountsComponent {

  enableChartOfAccount=false;
  constructor(
    private dialogRef: MatDialogRef<PopUpChartOfAccountsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
  ) {}


  ngOnInit() {
    console.log('AAAAAAAAAAAAA',this.data);
  }

  closeWindow() {
    const dados = { movementIndex: this.data.movementIndex, movementItenIndex: this.data.movementItenIndex };
    this.dialogRef.close(dados); 
  }


  selectAccount($event:any) {

    const dados = { 
      movementIndex: this.data.movementIndex, 
      movementItenIndex: this.data.movementItenIndex,
      accountData:$event
    };
    this.dialogRef.close(dados); 
  }

  createNewAccount($event:true) {

    if($event){
      this.enableChartOfAccount=true;
    } 
  }

  returnThisPage($event:true) {

    if($event){
      this.enableChartOfAccount=false;
    } 
    else {
      this.dialogRef.close(); 
    }
  }


}
