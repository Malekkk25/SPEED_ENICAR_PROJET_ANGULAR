import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PsychologistService,
  StudentAlert
} from '../../../../core/services/psychologist';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './alert-detail.html',
  styleUrl: './alert-detail.css',
})
export class AlertDetailComponent implements OnInit {
  private svc = inject(PsychologistService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  alert = signal<StudentAlert | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Backend n'a pas GET /alerts/:id, on charge la liste et on filtre
    this.svc.getStudentsAtRisk().subscribe({
      next: res => {
        const found = res.data.find(a => a.studentId === id);
        this.alert.set(found ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  initial(a: StudentAlert): string {
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
