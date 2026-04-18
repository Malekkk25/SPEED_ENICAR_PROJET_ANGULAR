import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService, Absence } from '../../../core/services/student';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-absences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './absences.html',
  styleUrl: './absences.css'
})
export class AbsencesComponent implements OnInit {
  private svc = inject(StudentService);

  readonly absences = signal<Absence[]>([]);
  readonly unjustifiedCount = signal<number>(0);
  readonly loading = signal(true);
  readonly activeFilter = signal<'ALL' | 'UNJUSTIFIED'>('ALL');
  readonly error = signal(false);

  ngOnInit() {
    this.loading.set(true);

    forkJoin({
      absences: this.svc.getAbsences(),
      count: this.svc.getAbsencesCount()
    }).subscribe({
      next: ({ absences, count }) => {
        this.absences.set(absences.data.content);
        this.unjustifiedCount.set(count.data.unjustifiedCount);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  setFilter(filter: 'ALL' | 'UNJUSTIFIED') {
    this.activeFilter.set(filter);
  }

  readonly filteredAbsences = computed(() => {
    if (this.activeFilter() === 'UNJUSTIFIED') {
      return this.absences().filter(a => !a.justified);
    }
    return this.absences();
  });

  getStatusClass(justified: boolean): string {
    return justified ? 'badge-success' : 'badge-warning';
  }

  getStatusLabel(justified: boolean): string {
    return justified ? 'Justifiée' : 'Non justifiée';
  }
}