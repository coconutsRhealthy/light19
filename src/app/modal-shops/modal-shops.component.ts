import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-modal-shops',
  imports: [RouterModule],
  templateUrl: './modal-shops.component.html',
})
export class ModalShopsComponent {
  @Input() isVisible: boolean = false;
  @Input() shops: string[] = [];
  @Input() dateStringLatestShops: string = '';

  @Output() closed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }
}
