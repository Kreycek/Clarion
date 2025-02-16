import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-ok',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-ok.component.html',
  styleUrl: './modal-ok.component.css'
})
export class ModalOkComponent {


    @Input() isVisible = false; // Controla a exibição da modal
    @Input() message: string = 'Tem certeza que deseja continuar?'; // Mensagem personalizada
  
    @Output() onConfirm = new EventEmitter<void>(); // Evento para confirmar
    
  confirm() {
    this.onConfirm.emit(); // Emite o evento de confirmação
    this.isVisible = true;

  }

}
