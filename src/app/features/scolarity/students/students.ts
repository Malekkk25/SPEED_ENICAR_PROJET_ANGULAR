import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScolarityService } from '../services/scolarity.service';
import { StudentDossier } from '../models/scolarity.models';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css'
})
export class StudentsComponent implements OnInit {
  private service = inject(ScolarityService);
  private router = inject(Router);

  students = signal<StudentDossier[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');
  showForm = signal(false);
  saving = signal(false);
  formError = signal('');

  form = {
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    department: '',
    level: '',
    enrollmentYear: new Date().getFullYear()
  };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.getStudents(0, 50).subscribe({
      next: (page) => { this.students.set(page.content); this.loading.set(false); },
      error: () => { this.error.set('Erreur chargement.'); this.loading.set(false); }
    });
  }

  get filtered() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.students();
    return this.students().filter(s =>
      (s.firstName + ' ' + s.lastName).toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.department?.toLowerCase().includes(term)
    );
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openForm() {
    this.form = {
      firstName: '', lastName: '', email: '',
      studentId: '', department: '', level: '',
      enrollmentYear: new Date().getFullYear()
    };
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  submitForm() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.studentId) {
      this.formError.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    this.service.createStudent(this.form).subscribe({
      next: () => { this.closeForm(); this.load(); this.saving.set(false); },
      error: (err) => {
        this.formError.set(err?.error?.message ?? 'Erreur lors de la création.');
        this.saving.set(false);
      }
    });
  }

  initials(s: StudentDossier) {
    return (s.firstName?.[0] ?? '') + (s.lastName?.[0] ?? '');
  }
}