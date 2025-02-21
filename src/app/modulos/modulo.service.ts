
  import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
  
  
  
  
  @Injectable({
    providedIn: 'root',
  })
  export class ModuloService {
  
  
    desabilitaCamposFormGroup(form:FormGroup) {
        Object.keys(form.controls).forEach(controlName => {

        const control = form.get(controlName);
        control?.clearValidators();
        control?.updateValueAndValidity();
        });
    }

    habilitaCamposFormGroup(form:FormGroup,camposAtivar:any[]) {
        Object.keys(form.controls).forEach(controlName => {
        const control = form.get(controlName);
        // Defina as validações conforme necessário

        const existe=camposAtivar.some((campo)=>campo===controlName)
        // if (controlName === 'codDocument' || controlName === 'description' || controlName === 'country') {
            if(existe)
            control?.setValidators([Validators.required]);
        // }
        // Adicione as validações conforme o caso
        control?.updateValueAndValidity();
        });
    }

    isFieldInvalid(fieldName: string,  form:any): boolean {


        const field = (form as FormGroup).get(fieldName);
      
        return !!(field && field.invalid && (field.dirty || field.touched));
      }

    forcarAtivarValidarores(fieldName: string, form:FormGroup): void {
        const field = form.get(fieldName);
        if (field) {
            field.markAsTouched(); // Marca como "tocado"
            field.markAsDirty();   // Marca como "modificado"
            field.updateValueAndValidity(); // Recalcula a validação
        }
    }

    ativarvalidadores(form:FormGroup) {
        Object.keys(form.controls).forEach(fieldName => {            
            this.forcarAtivarValidarores(fieldName,form);
        });
    }


    forcarDesativarValidarores(fieldName: string, form:FormGroup): void {
        const field = form.get(fieldName);
        if (field) {
            field.markAsPristine(); // Marca como "não modificado"
            field.markAsUntouched(); // Marca como "não tocado"
            field.updateValueAndValidity(); // Atualiza o estado da validação
        }
    }

    desativarValidadores(form:FormGroup) {
        Object.keys(form.controls).forEach(fieldName => {            
            this.forcarDesativarValidarores(fieldName,form);
        });
    }




}