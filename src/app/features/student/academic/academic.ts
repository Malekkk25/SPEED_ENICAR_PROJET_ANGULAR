import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, AcademicRecord } from '../../../core/services/student';

@Component({
  selector: 'app-academic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './academic.html',
  styleUrl: './academic.css'
})
export class AcademicComponent implements OnInit {
  private svc = inject(StudentService);

  grades = signal<AcademicRecord[]>([]);
  average = signal<number>(0);
  loading = signal(true);
  selectedSemester = signal<string>('');

  semesters = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

  ngOnInit() {
    this.loadGrades();
    this.loadAverage();
  }

  loadGrades() {
    this.loading.set(true);
    const semester = this.selectedSemester() || undefined;
    this.svc.getGrades(semester).subscribe({
      next: res => {
        this.grades.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadAverage() {
    const semester = this.selectedSemester() || undefined;
    this.svc.getAverage(semester).subscribe({
      next: res => this.average.set(res.data.average)
    });
  }

  changeSemester(semester: string) {
    this.selectedSemester.set(semester);
    this.loadGrades();
    this.loadAverage();
  }

  getGradeColor(percentage: number): string {
    if (percentage >= 75) return '#22c55e';
    if (percentage >= 50) return '#3b82f6';
    if (percentage >= 25) return '#f97316';
    return '#ef4444';
  }

  getGradeBadgeClass(isPassing: boolean): string {
    return isPassing ? 'badge-success' : 'badge-danger';
  }
}