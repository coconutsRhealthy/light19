import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prikbord-modal',
  imports: [FormsModule],
  templateUrl: './prikbord-modal.component.html',
  styleUrls: ['./prikbord-modal.component.css']
})
export class PrikbordModalComponent {
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

  submitted = false;

  closeModal() {
    this.isVisible = false;
    this.closed.emit();
    this.submitted = false;

    this.newRow = {
      webshop: '',
      code: '',
      percentage: '',
      date: '',
      name: ''
    };
  }

  submit() {
    // Optional: validate form here
    this.added.emit(this.newRow); // let the parent decide what to do next
    this.submitted = true;
  }

  resetForm() {
    this.newRow = {
      webshop: '',
      code: '',
      percentage: '',
      date: '',
      name: ''
    };
  }
}
