import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  PsychologistService,
  PsychologistDashboard,
  Appointment,
  StudentAlert
}  from '../../../core/services/psychologist'
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private svc = inject(PsychologistService);

  stats = signal<PsychologistDashboard | null>(null);
  todaySchedule = signal<Appointment[]>([]);
  alerts = signal<StudentAlert[]>([]);
  pendingRequests = signal<Appointment[]>([]);
  loading = signal(true);
  error = signal('');

  today = new Date();
  greeting = signal('');

  ngOnInit() {
    // Greeting based on time
    const h = new Date().getHours();
    this.greeting.set(h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir');

    // Load dashboard stats
    this.svc.getDashboard().subscribe({
      next: res => {
        this.stats.set(res.data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Impossible de charger le tableau de bord');
        this.loading.set(false);
      }
    });

    // Load today's appointments
    this.svc.getTodayAppointments().subscribe({
      next: res => this.todaySchedule.set(res.data)
    });

    // Load pending requests
    this.svc.getPendingRequests().subscribe({
      next: res => this.pendingRequests.set(res.data)
    });

    // Load alerts
    this.svc.getStudentsAtRisk().subscribe({
      next: res => this.alerts.set(res.data)
    });
  }

  // ── Helpers for template ──────────────────────────

  typeLabel(t: string): string {
    const map: Record<string, string> = {
      INITIAL: 'Initiale',
      FOLLOW_UP: 'Suivi',
      URGENT: 'Urgent'
    };
    return map[t] ?? t;
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmé',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé'
    };
    return map[s] ?? s;
  }

  riskIcon(level: string): string {
    const map: Record<string, string> = {
      CRITICAL: '🚨',
      HIGH: '🔴',
      MODERATE: '🟡',
      LOW: '🟢'
    };
    return map[level] ?? '⚪';
  }

  riskLabel(level: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'Critique',
      HIGH: 'Élevé',
      MODERATE: 'Modéré',
      LOW: 'Faible'
    };
    return map[level] ?? level;
  }
}