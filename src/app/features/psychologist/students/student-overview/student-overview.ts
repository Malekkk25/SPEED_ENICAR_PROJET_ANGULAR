import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PsychologistService,
  ConfidentialRecord,
  Appointment
} from '../../../../core/services/psychologist';

interface StudentCard {
  studentId: number;
  studentName: string;
  department: string;
  level: string;
  lastActivity: string;
  riskLevel: string;
  recordCount: number;
  appointmentCount: number;
  hasUrgent: boolean;
}

@Component({
  selector: 'app-student-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './student-overview.html',
  styleUrl: './student-overview.css',
})
export class StudentOverviewComponent implements OnInit {
  private svc = inject(PsychologistService);

  students = signal<StudentCard[]>([]);
  filtered = signal<StudentCard[]>([]);
  loading = signal(true);
  search = '';

  private colors = ['#5bc8af', '#2980b9', '#8e44ad', '#e67e22', '#c0392b', '#27ae60', '#2c3e50'];

  ngOnInit() {
    const studentMap = new Map<number, StudentCard>();

    // Load from records
    this.svc.getAllRecords(0, 100).subscribe({
      next: res => {
        for (const r of res.data.content) {
          const existing = studentMap.get(r.studentId);
          if (!existing) {
            studentMap.set(r.studentId, {
              studentId: r.studentId,
              studentName: r.studentName,
              department: r.studentDepartment,
              level: r.studentLevel,
              lastActivity: r.sessionDate,
              riskLevel: r.riskLevel,
              recordCount: 1,
              appointmentCount: 0,
              hasUrgent: false
            });
          } else {
            existing.recordCount++;
            if (r.sessionDate > existing.lastActivity) {
              existing.lastActivity = r.sessionDate;
              existing.riskLevel = r.riskLevel;
            }
          }
        }

        // Then load from appointments to catch students without records
        this.svc.getAppointments(0, 100).subscribe({
          next: apptRes => {
            for (const a of apptRes.data.content) {
              const existing = studentMap.get(a.studentId);
              if (!existing) {
                studentMap.set(a.studentId, {
                  studentId: a.studentId,
                  studentName: a.studentName,
                  department: a.studentDepartment,
                  level: '',
                  lastActivity: a.dateTime,
                  riskLevel: 'LOW',
                  recordCount: 0,
                  appointmentCount: 1,
                  hasUrgent: a.type === 'URGENT'
                });
              } else {
                existing.appointmentCount++;
                if (a.type === 'URGENT') existing.hasUrgent = true;
              }
            }

            const list = Array.from(studentMap.values());
            this.students.set(list);
            this.filtered.set(list);
            this.loading.set(false);
          },
          error: () => {
            // Even if appointments fail, show records-based students
            const list = Array.from(studentMap.values());
            this.students.set(list);
            this.filtered.set(list);
            this.loading.set(false);
          }
        });
      },
      error: () => this.loading.set(false)
    });
  }

  filterStudents() {
    const q = this.search.toLowerCase();
    this.filtered.set(this.students().filter(s =>
      s.studentName.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    ));
  }

  initial(s: StudentCard): string {
    const parts = s.studentName.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : s.studentName.substring(0, 2).toUpperCase();
  }

  avatarColor(s: StudentCard): string {
    return this.colors[s.studentId % this.colors.length];
  }

  riskLabel(level: string): string {
    return ({ LOW: 'Faible', MODERATE: 'Modere', HIGH: 'Eleve', CRITICAL: 'Critique' } as any)[level] ?? level;
  }
}
