import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PsychologistService,
  Appointment
} from '../../../../core/services/psychologist';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './appointment-detail.html',
  styleUrl: './appointment-detail.css',
})
export class AppointmentDetailComponent implements OnInit {
  private svc = inject(PsychologistService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  appt = signal<Appointment | null>(null);
  notesText = '';
  editingNotes = signal(false);
  loading = signal(true);
  error = signal('');
  actionLoading = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAppointment(id);
  }

  private loadAppointment(id: number) {
    this.loading.set(true);
    this.svc.getAppointments(0, 100).subscribe({
      next: res => {
        const found = res.data.content.find(a => a.id === id);
        if (found) {
          this.appt.set(found);
          this.notesText = found.notes ?? '';
        } else {
          this.error.set('Rendez-vous introuvable');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur de chargement');
        this.loading.set(false);
      }
    });
  }

  confirm() {
    const a = this.appt();
    if (!a || this.actionLoading()) return;
    this.actionLoading.set(true);
    this.svc.confirmAppointment(a.id).subscribe({
      next: res => {
        // Force le signal a se mettre a jour avec un nouvel objet
        this.appt.set({ ...res.data });
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la confirmation');
        this.actionLoading.set(false);
      }
    });
  }

  cancel() {
    const a = this.appt();
    if (!a || this.actionLoading()) return;
    this.actionLoading.set(true);
    this.svc.cancelAppointment(a.id, 'Annule par le psychologue').subscribe({
      next: res => {
        this.appt.set({ ...res.data });
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de l\'annulation');
        this.actionLoading.set(false);
      }
    });
  }

  saveNotes() {
    const a = this.appt();
    if (!a || this.actionLoading()) return;
    this.actionLoading.set(true);
    this.svc.completeAppointment(a.id, this.notesText).subscribe({
      next: res => {
        this.appt.set({ ...res.data });
        this.editingNotes.set(false);
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la completion');
        this.actionLoading.set(false);
      }
    });
  }

  initial(): string {
    const name = this.appt()?.studentName;
    if (!name) return '??';
    const p = name.split(' ');
    return p.length >= 2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
  }

  typeLabel(t: string): string {
    return ({ INITIAL: 'Initiale', FOLLOW_UP: 'Suivi', URGENT: 'Urgent' } as Record<string, string>)[t] ?? t;
  }

  statusLabel(s: string): string {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirme', COMPLETED: 'Termine', CANCELLED: 'Annule' } as Record<string, string>)[s] ?? s;
  }
}