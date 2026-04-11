import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `<p style="padding:32px">Documents medicaux</p>`
})
export class DocumentsComponent {}
