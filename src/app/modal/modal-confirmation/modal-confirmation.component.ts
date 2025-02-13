import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-confirmation.component.html',
  styleUrl: './modal-confirmation.component.css'
})
export class ModalConfirmationComponent {

  @Input() isVisible = false; // Controla a exibição da modal
  @Input() message: string = 'Tem certeza que deseja continuar?'; // Mensagem personalizada

  @Output() onConfirm = new EventEmitter<void>(); // Evento para confirmar
  @Output() onCancel = new EventEmitter<void>(); // Evento para cancelar
  @Output() teste = new EventEmitter<number>(); // Evento para cancelar

  confirm() {
    this.onConfirm.emit(); // Emite o evento de confirmação
    this.isVisible = true;
    this.teste.emit(1);
  }

  cancel() {
    this.onCancel.emit(); // Emite o evento de cancelamento
    this.isVisible = false;
  }
  
}
