import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal-ok',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-ok.component.html',
  styleUrl: './modal-ok.component.css'
})
export class ModalOkComponent {

    @Input() isVisible = false;
    @Input() message: string = '';
  
    private responseSubject = new Subject<boolean>();
  // Método para abrir o modal e retornar um Observable
  openModal(): Promise<boolean> {
    this.isVisible = true;
    return new Promise(resolve => {
      this.responseSubject = new Subject<boolean>();
      this.responseSubject.subscribe(response => {
        this.isVisible = false;
        resolve(response);
      });
    });
  }

  confirm() {
    this.responseSubject.next(true);
    this.responseSubject.complete();
  }
  
}
