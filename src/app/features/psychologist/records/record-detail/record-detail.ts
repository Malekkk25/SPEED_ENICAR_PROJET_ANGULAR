import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PsychologistService,
  ConfidentialRecord,
  UpdateRecordRequest
} from '../../../../core/services/psychologist';

@Component({
  selector: 'app-record-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  templateUrl: './record-detail.html',
  styleUrl: './record-detail.css',
})
export class RecordDetailComponent implements OnInit {
  private svc = inject(PsychologistService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  record = signal<ConfidentialRecord | null>(null);
  loading = signal(true);
  deleting = signal(false);
  editing = signal(false);
  saving = signal(false);
  error = signal('');

  // Edit form
  editForm: UpdateRecordRequest = {};

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getAllRecords(0, 50).subscribe({
      next: res => {
        const found = res.data.content.find(r => r.id === id);
        this.record.set(found ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startEdit() {
    const r = this.record();
    if (!r) return;
    this.editForm = {
      observations: r.observations,
      riskLevel: r.riskLevel,
      recommendations: r.recommendations ?? '',
      followUpRequired: r.followUpRequired,
      nextSessionDate: r.nextSessionDate,
      sessionDurationMinutes: r.sessionDurationMinutes,
      interventions: r.interventions ?? '',
      studentProgress: r.studentProgress ?? ''
    };
    this.editing.set(true);
    this.error.set('');
  }

  cancelEdit() {
    this.editing.set(false);
  }

  saveEdit() {
    const r = this.record();
    if (!r) return;
    this.saving.set(true);
    this.error.set('');

    this.svc.updateRecord(r.id, this.editForm).subscribe({
      next: res => {
        this.record.set({ ...res.data });
        this.editing.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la modification');
        this.saving.set(false);
      }
    });
  }

  delete() {
    if (!confirm('Supprimer cette fiche ? Cette action est irreversible.')) return;
    this.deleting.set(true);
    this.svc.deleteRecord(this.record()!.id).subscribe({
      next: () => this.router.navigate(['/psychologist/records']),
      error: (err) => {
        this.deleting.set(false);
        alert(err.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  viewHistory() {
    const r = this.record();
    if (!r) return;
    this.router.navigate(['/psychologist/students', r.studentId]);
  }

  initial(r: ConfidentialRecord): string {
    if (!r.studentName) return '??';
    const parts = r.studentName.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : r.studentName.substring(0, 2).toUpperCase();
  }

  riskLabel(level: string): string {
    return ({ LOW: 'Faible', MODERATE: 'Modere', HIGH: 'Eleve', CRITICAL: 'Critique' } as any)[level] ?? level;
  }
}