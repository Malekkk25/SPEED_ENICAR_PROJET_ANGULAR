import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentService, StudentProfile, MoodStats } from '../../../core/services/student';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class StudentDashboardComponent implements OnInit {
  private svc = inject(StudentService);

  profile = signal<StudentProfile | null>(null);
  moodStats = signal<MoodStats | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.loadProfile();
    this.loadMoodStats();
  }

  loadProfile() {
    this.svc.getProfile().subscribe({
      next: res => { this.profile.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadMoodStats() {
    this.svc.getMoodStats('week').subscribe({
      next: res => this.moodStats.set(res.data)
    });
  }

  getMoodLabel(level: number): string {
    const labels: Record<number, string> = {
      1: 'Très mal', 2: 'Pas bien', 3: 'Neutre', 4: 'Bien', 5: 'Très bien'
    };
    return labels[Math.round(level)] ?? 'Neutre';
  }
}