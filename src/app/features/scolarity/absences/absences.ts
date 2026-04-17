import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScolarityService } from '../services/scolarity.service';
import { Absence } from '../models/scolarity.models';

@Component({
  selector: 'app-absences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './absences.html',
  styleUrl: './absences.css'
})
export class AbsencesComponent implements OnInit {
  private service = inject(ScolarityService);

  absences = signal<Absence[]>([]);
  loading = signal(true);
  selectedDays = signal(3);
  processingId = signal<number | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.getProlongedAbsences(this.selectedDays()).subscribe({
      next: (abs) => { this.absences.set(abs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onDaysChange(event: Event) {
    this.selectedDays.set(Number((event.target as HTMLSelectElement).value));
    this.load();
  }

  justify(id: number, justified: boolean) {
    this.processingId.set(id);
    this.service.justifyAbsence(id, justified).subscribe({
      next: () => { this.load(); this.processingId.set(null); },
      error: () => this.processingId.set(null)
    });
  }

  durationClass(days: number) {
    if (days >= 14) return 'badge-red';
    if (days >= 7)  return 'badge-orange';
    return 'badge-yellow';
  }
}