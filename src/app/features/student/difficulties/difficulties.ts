import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DifficultyReport {
  id: number;
  type: string;
  description: string;
  urgency: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-difficulties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './difficulties.html',
  styleUrl: './difficulties.css'
})
export class DifficultiesComponent implements OnInit {

  reports = signal<DifficultyReport[]>([]);
  loading = signal(true);
  submitting = signal(false);
  showForm = signal(false);
  activeFilter = signal<string>('ALL');

  // Formulaire
  type = '';
  description = '';
  urgency = 'LOW';

  types = [
    { value: 'ACADEMIC', label: '📚 Académique' },
    { value: 'FINANCIAL', label: '💰 Financière' },
    { value: 'HEALTH', label: '🏥 Santé' },
    { value: 'SOCIAL', label: '👥 Sociale' },
    { value: 'OTHER', label: '📝 Autre' },
  ];

  urgencies = [
    { value: 'LOW', label: '🟢 Faible' },
    { value: 'MEDIUM', label: '🟡 Moyenne' },
    { value: 'HIGH', label: '🟠 Élevée' },
    { value: 'CRITICAL', label: '🔴 Critique' },
  ];

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading.set(true);
    // À connecter avec le service
    this.loading.set(false);
  }

  filteredReports() {
    if (this.activeFilter() === 'ALL') return this.reports();
    return this.reports().filter(r => r.status === this.activeFilter());
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  submitReport() {
    if (!this.type || !this.description.trim()) return;
    this.submitting.set(true);

    // À connecter avec le service
    setTimeout(() => {
      this.submitting.set(false);
      this.showForm.set(false);
      this.resetForm();
      this.loadReports();
    }, 1000);
  }

  resetForm() {
    this.type = '';
    this.description = '';
    this.urgency = 'LOW';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'OPEN': 'status-pending',
      'IN_PROGRESS': 'status-progress',
      'RESOLVED': 'status-confirmed',
      'CLOSED': 'status-cancelled'
    };
    return classes[status] ?? 'status-pending';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'OPEN': '🔓 Ouvert',
      'IN_PROGRESS': '⏳ En cours',
      'RESOLVED': '✅ Résolu',
      'CLOSED': '🔒 Fermé'
    };
    return labels[status] ?? status;
  }

  getUrgencyClass(urgency: string): string {
    const classes: Record<string, string> = {
      'LOW': 'urgency-low',
      'MEDIUM': 'urgency-medium',
      'HIGH': 'urgency-high',
      'CRITICAL': 'urgency-critical'
    };
    return classes[urgency] ?? 'urgency-low';
  }

  getUrgencyLabel(urgency: string): string {
    return this.urgencies.find(u => u.value === urgency)?.label ?? urgency;
  }

  getTypeLabel(type: string): string {
    return this.types.find(t => t.value === type)?.label ?? type;
  }
}