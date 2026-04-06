import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  PsychologistService,
  CreateRecordRequest
} from  '../../../../core/services/psychologist';

@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './record-form.html',
  styleUrl: './record-form.css',
})
export class RecordFormComponent implements OnInit {
  private svc = inject(PsychologistService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  saving = signal(false);
  error = signal('');

  form: CreateRecordRequest = {
    studentId: 0,
    sessionDate: new Date().toISOString().split('T')[0],
    observations: '',
    riskLevel: 'LOW',
    recommendations: '',
    followUpRequired: false,
    nextSessionDate: undefined,
    sessionDurationMinutes: 45,
    interventions: '',
    studentProgress: ''
  };

  ngOnInit() {
    const sid = this.route.snapshot.queryParamMap.get('studentId');
    if (sid) this.form.studentId = Number(sid);
  }

  submit() {
    this.saving.set(true);
    this.error.set('');

    this.svc.createRecord(this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/psychologist/records']);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Erreur lors de la creation');
      }
    });
  }
}
