import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, MoodEntry, MoodStats } from '../../../core/services/student';

@Component({
  selector: 'app-mood-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-tracker.html',
  styleUrl: './mood-tracker.css'
})
export class MoodTrackerComponent implements OnInit {
  private svc = inject(StudentService);

  moods = signal<MoodEntry[]>([]);
  stats = signal<MoodStats | null>(null);
  loading = signal(true);
  submitting = signal(false);
  selectedPeriod = signal<'week' | 'month'>('week');
  showForm = signal(false);

  // Formulaire
  selectedLevel = signal<number>(0);
  note = '';
  today = new Date().toISOString().split('T')[0];

  emojis = [
    { level: 1, emoji: '😢', label: 'Très mal' },
    { level: 2, emoji: '😕', label: 'Pas bien' },
    { level: 3, emoji: '😐', label: 'Neutre' },
    { level: 4, emoji: '🙂', label: 'Bien' },
    { level: 5, emoji: '😄', label: 'Très bien' },
  ];

  ngOnInit() {
    this.loadMoods();
    this.loadStats();
  }

  loadMoods() {
    this.loading.set(true);
    this.svc.getMoods().subscribe({
      next: res => {
        this.moods.set(res.data.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadStats() {
    this.svc.getMoodStats(this.selectedPeriod()).subscribe({
      next: res => this.stats.set(res.data)
    });
  }

  selectLevel(level: number) {
    this.selectedLevel.set(level);
  }

  changePeriod(period: 'week' | 'month') {
    this.selectedPeriod.set(period);
    this.loadStats();
  }

  submitMood() {
    if (this.selectedLevel() === 0) return;
    this.submitting.set(true);

    const entry = this.emojis.find(e => e.level === this.selectedLevel());

    this.svc.createMood({
      moodLevel: this.selectedLevel(),
      emoji: entry?.emoji,
      note: this.note,
      date: this.today
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.selectedLevel.set(0);
        this.note = '';
        this.loadMoods();
        this.loadStats();
      },
      error: (err) => {
        this.submitting.set(false);
        const message = err.error?.message || 'Une entrée d\'humeur existe déjà pour aujourd\'hui';
        alert(message);
      }
    });
  }

  deleteMood(id: number) {
    this.svc.deleteMood(id).subscribe({
      next: () => {
        this.loadMoods();
        this.loadStats(); // ← ajoute cette ligne
      }
    });
  }

  getMoodEmoji(level: number): string {
    return this.emojis.find(e => e.level === level)?.emoji ?? '😐';
  }

  getMoodLabel(level: number): string {
    return this.emojis.find(e => e.level === level)?.label ?? 'Neutre';
  }

  getMoodColor(level: number): string {
    const colors: Record<number, string> = {
      1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#3b82f6'
    };
    return colors[level] ?? '#94a3b8';
  }
}