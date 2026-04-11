import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule],
  template: `<p style="padding:32px">Dossiers étudiants</p>`
})
export class StudentsComponent {}