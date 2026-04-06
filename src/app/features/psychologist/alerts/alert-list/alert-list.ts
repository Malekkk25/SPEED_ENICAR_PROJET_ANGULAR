import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PsychologistService,
  StudentAlert,
  Appointment
} from '../../../../core/services/psychologist';

// Unified alert item for display
interface AlertItem {
  type: 'risk' | 'urgent_appointment';
  studentId: number;
  studentName: string;
  department: string;
  level: string;
  riskLevel: string;
  reasons: string[];
  // Risk-specific
  moodAverage?: number;
  absences?: number;
  academicAverage?: number;
  lastSessionDate?: string;
  followUpRequired?: boolean;
  // Appointment-specific
  appointmentId?: number;
  appointmentDate?: string;
  appointmentReason?: string;
}

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './alert-list.html',
  styleUrl: './alert-list.css',
})
export class AlertListComponent implements OnInit {
  private svc = inject(PsychologistService);

  allAlerts = signal<AlertItem[]>([]);
  loading = signal(true);
  levelFilter = '';

  ngOnInit() {
    let riskAlerts: AlertItem[] = [];
    let urgentAlerts: AlertItem[] = [];
    let loadedCount = 0;

    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        // Merge and deduplicate by studentId (risk alerts take priority)
        const merged = [...riskAlerts];
        for (const ua of urgentAlerts) {
          if (!merged.find(a => a.studentId === ua.studentId)) {
            merged.push(ua);
          } else {
            // Add urgent reason to existing alert
            const existing = merged.find(a => a.studentId === ua.studentId);
            if (existing) {
              existing.reasons = [...existing.reasons, ...ua.reasons];
              if (!existing.riskLevel || existing.riskLevel === 'LOW' || existing.riskLevel === 'MODERATE') {
                existing.riskLevel = 'HIGH';
              }
            }
          }
        }
        // Sort: CRITICAL first, then HIGH, MODERATE, LOW
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 };
        merged.sort((a, b) => (order[a.riskLevel] ?? 4) - (order[b.riskLevel] ?? 4));
        this.allAlerts.set(merged);
        this.loading.set(false);
      }
    };

    // Load risk alerts from backend
    this.svc.getStudentsAtRisk().subscribe({
      next: res => {
        riskAlerts = res.data.map(a => ({
          type: 'risk' as const,
          studentId: a.studentId,
          studentName: a.studentName,
          department: a.department,
          level: a.level,
          riskLevel: a.currentRiskLevel,
          reasons: a.alertReasons,
          moodAverage: a.recentMoodAverage ?? undefined,
          absences: a.unjustifiedAbsences,
          academicAverage: a.academicAverage,
          lastSessionDate: a.lastSessionDate ?? undefined,
          followUpRequired: a.followUpRequired
        }));
        checkDone();
      },
      error: () => checkDone()
    });

    // Load URGENT appointments and convert to alerts
    this.svc.getAppointments(0, 100).subscribe({
      next: res => {
        const urgentAppts = res.data.content.filter(
          a => a.type === 'URGENT' && a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
        );
        urgentAlerts = urgentAppts.map(a => ({
          type: 'urgent_appointment' as const,
          studentId: a.studentId,
          studentName: a.studentName,
          department: a.studentDepartment,
          level: '',
          riskLevel: 'HIGH',
          reasons: [`RDV urgent : ${a.reason || 'Motif non precise'} (${new Date(a.dateTime).toLocaleDateString('fr')})`],
          appointmentId: a.id,
          appointmentDate: a.dateTime,
          appointmentReason: a.reason
        }));
        checkDone();
      },
      error: () => checkDone()
    });
  }

  displayedAlerts(): AlertItem[] {
    let list = this.allAlerts();
    if (this.levelFilter) list = list.filter(a => a.riskLevel === this.levelFilter);
    return list;
  }

  countByLevel(level: string): number {
    return this.allAlerts().filter(a => a.riskLevel === level).length;
  }

  initial(a: AlertItem): string {
    if (!a.studentName) return '??';
    const parts = a.studentName.split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : a.studentName.substring(0, 2).toUpperCase();
  }

  levelLabel(l: string): string {
    return ({ CRITICAL: 'Critique', HIGH: 'Eleve', MODERATE: 'Modere', LOW: 'Faible' } as any)[l] ?? l;
  }

  levelEmoji(l: string): string {
    return ({ CRITICAL: '🚨', HIGH: '🔴', MODERATE: '🟡', LOW: '🟢' } as any)[l] ?? '⚪';
  }
}
