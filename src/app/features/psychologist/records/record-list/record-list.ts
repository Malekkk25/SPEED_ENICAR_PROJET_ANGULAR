import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PsychologistService,
  ConfidentialRecord,
  Page
} from  '../../../../core/services/psychologist';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './record-list.html',
  styleUrl: './record-list.css',
})
export class RecordListComponent implements OnInit {
  private svc = inject(PsychologistService);
 private route = inject(ActivatedRoute);
 
  records = signal<ConfidentialRecord[]>([]);
  loading = signal(true);
  search = '';
  currentPage = 0;
  totalElements = 0;

 ngOnInit() {
  const studentId = this.route.snapshot.paramMap.get('studentId');
  if (studentId) {
    this.svc.getStudentRecords(Number(studentId)).subscribe({
      next: res => { this.records.set(res.data.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  } else {
    this.load();
  }
}

  load(page = 0) {
    this.loading.set(true);
    this.svc.getAllRecords(page, 15).subscribe({
      next: res => {
        this.records.set(res.data.content);
        this.totalElements = res.data.totalElements;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get filteredRecords(): ConfidentialRecord[] {
    if (!this.search.trim()) return this.records();
    const q = this.search.toLowerCase();
    return this.records().filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.observations.toLowerCase().includes(q) ||
      (r.recommendations ?? '').toLowerCase().includes(q)
    );
  }

  initial(r: ConfidentialRecord): string {
    if (!r.studentName) return '??';
    const parts = r.studentName.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : r.studentName.substring(0, 2).toUpperCase();
  }

  riskLabel(level: string): string {
    const map: Record<string, string> = {
      LOW: 'Faible', MODERATE: 'Modere', HIGH: 'Eleve', CRITICAL: 'Critique'
    };
    return map[level] ?? level;
  }

  prevPage() { if (this.currentPage > 0) { this.currentPage--; this.load(this.currentPage); } }
  nextPage() { this.currentPage++; this.load(this.currentPage); }
}
