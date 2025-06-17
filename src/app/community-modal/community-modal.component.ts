import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-community-modal',
  imports: [FormsModule],
  templateUrl: './community-modal.component.html',
  styleUrls: ['./modal.component.css', './../modal/modal.component.css']
})
export class CommunityModalComponent {
  @Input() isVisible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() added = new EventEmitter<any>();

  newRow = {
    webshop: '',
    code: '',
    percentage: '',
    date: '',
    name: ''
  };

  closeModal() {
    this.isVisible = false;
    this.closed.emit();
  }

  submit() {
    // Optional: add validation here

    this.added.emit(this.newRow);
    this.closeModal();

    // Reset form for next time
    this.newRow = {
      webshop: '',
      code: '',
      percentage: '',
      date: '',
      name: ''
    };
  }
}
