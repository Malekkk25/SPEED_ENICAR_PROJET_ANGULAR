import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import {
  PsychologistService,
  ConfidentialRecord,
  Appointment
} from '../../../../core/services/psychologist';

@Component({
  selector: 'app-student-history',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './student-history.html',
  styleUrl: './student-history.css',
})
export class StudentHistoryComponent implements OnInit {
  private svc = inject(PsychologistService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  studentId = 0;
  studentName = signal('');
  studentDepartment = signal('');
  studentLevel = signal('');
  records = signal<ConfidentialRecord[]>([]);
  appointments = signal<Appointment[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));

    // Load records for this student
    this.svc.getStudentRecords(this.studentId, 0, 50).subscribe({
      next: res => {
        this.records.set(res.data.content);
        if (res.data.content.length > 0) {
          const first = res.data.content[0];
          this.studentName.set(first.studentName);
          this.studentDepartment.set(first.studentDepartment);
          this.studentLevel.set(first.studentLevel);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    // Also load appointments to find this student's name if no records
    this.svc.getAppointments(0, 100).subscribe({
      next: res => {
        const studentAppts = res.data.content.filter(a => a.studentId === this.studentId);
        this.appointments.set(studentAppts);
        // If we didn't get the name from records, get it from appointments
        if (!this.studentName() && studentAppts.length > 0) {
          this.studentName.set(studentAppts[0].studentName);
          this.studentDepartment.set(studentAppts[0].studentDepartment);
        }
      }
    });
  }

  initial(): string {
    const name = this.studentName();
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
  }

  riskLabel(level: string): string {
    return ({ LOW: 'Faible', MODERATE: 'Modere', HIGH: 'Eleve', CRITICAL: 'Critique' } as any)[level] ?? level;
  }

  statusLabel(s: string): string {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirme', COMPLETED: 'Termine', CANCELLED: 'Annule' } as any)[s] ?? s;
  }

  typeLabel(t: string): string {
    return ({ INITIAL: 'Initiale', FOLLOW_UP: 'Suivi', URGENT: 'Urgent' } as any)[t] ?? t;
  }

  newRecord() {
    this.router.navigate(['/psychologist/records/new'], {
      queryParams: { studentId: this.studentId }
    });
  }
}
