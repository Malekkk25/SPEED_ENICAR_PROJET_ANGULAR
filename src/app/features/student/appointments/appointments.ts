import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student';

export interface Appointment {
  id: number;
  dateTime: string;
  duration: number;
  status: string;
  type: string;
  reason: string;
  psychologistName: string;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class AppointmentsComponent implements OnInit {
  private svc = inject(StudentService);

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  submitting = signal(false);
  showForm = signal(false);
  activeFilter = signal<string>('ALL');

  // Formulaire
  reason = '';
  type = 'INITIAL';
  selectedDate = '';
  selectedTime = '';

  types = [
    { value: 'INITIAL', label: 'Consultation initiale' },
    { value: 'FOLLOW_UP', label: 'Suivi' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading.set(true);
    // À connecter avec AppointmentService quand disponible
    this.loading.set(false);
  }

  filteredAppointments() {
    if (this.activeFilter() === 'ALL') return this.appointments();
    return this.appointments().filter(a => a.status === this.activeFilter());
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  submitAppointment() {
    if (!this.reason.trim() || !this.selectedDate || !this.selectedTime) return;
    this.submitting.set(true);

    // À connecter avec AppointmentService
    setTimeout(() => {
      this.submitting.set(false);
      this.showForm.set(false);
      this.resetForm();
    }, 1000);
  }

  resetForm() {
    this.reason = '';
    this.type = 'INITIAL';
    this.selectedDate = '';
    this.selectedTime = '';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return classes[status] ?? 'status-pending';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmé',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] ?? status;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'INITIAL': 'Initiale',
      'FOLLOW_UP': 'Suivi',
      'URGENT': 'Urgent'
    };
    return labels[type] ?? type;
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'INITIAL': 'type-initial',
      'FOLLOW_UP': 'type-follow_up',
      'URGENT': 'type-urgent'
    };
    return classes[type] ?? '';
  }
}