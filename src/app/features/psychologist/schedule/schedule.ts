import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PsychologistService,
  TimeSlot,
  ScheduleUpdateRequest
} from '../../../core/services/psychologist';

interface DaySchedule {
  dayIndex: number;
  dayKey: string;       // "MONDAY", "TUESDAY"...
  dayName: string;
  dayShort: string;
  slots: SlotUI[];
}

interface SlotUI {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  id?: number;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class ScheduleComponent implements OnInit {
  private svc = inject(PsychologistService);

  schedule = signal<DaySchedule[]>([]);
  saving = signal(false);
  loading = signal(true);
  addingForDay = signal<number | null>(null);
  newStart = '09:00';
  newEnd = '09:30';

  // Mapping index <-> backend dayOfWeek string
  private days = [
    { key: 'MONDAY',    name: 'Lundi',    short: 'Lun' },
    { key: 'TUESDAY',   name: 'Mardi',    short: 'Mar' },
    { key: 'WEDNESDAY', name: 'Mercredi', short: 'Mer' },
    { key: 'THURSDAY',  name: 'Jeudi',    short: 'Jeu' },
    { key: 'FRIDAY',    name: 'Vendredi', short: 'Ven' },
    { key: 'SATURDAY',  name: 'Samedi',   short: 'Sam' },
  ];

  totalSlots = computed(() => this.schedule().reduce((acc, d) => acc + d.slots.length, 0));
  availableSlots = computed(() => this.schedule().reduce((acc, d) => acc + d.slots.filter(s => s.isAvailable).length, 0));
  totalHours = computed(() => {
    let mins = 0;
    this.schedule().forEach(d => d.slots.filter(s => s.isAvailable).forEach(s => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      mins += (eh * 60 + em) - (sh * 60 + sm);
    }));
    return (mins / 60).toFixed(1);
  });

  ngOnInit() {
    this.svc.getSchedule().subscribe({
      next: res => {
        this.buildSchedule(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleSlot(dayIdx: number, slotIdx: number) {
    this.schedule.update(sched =>
      sched.map(d => d.dayIndex === dayIdx
        ? { ...d, slots: d.slots.map((s, i) => i === slotIdx ? { ...s, isAvailable: !s.isAvailable } : s) }
        : d
      )
    );
  }

  removeSlot(dayIdx: number, slotIdx: number) {
    this.schedule.update(sched =>
      sched.map(d => d.dayIndex === dayIdx
        ? { ...d, slots: d.slots.filter((_, i) => i !== slotIdx) }
        : d
      )
    );
  }

  addSlot(dayIdx: number) {
    this.addingForDay.set(dayIdx);
    this.newStart = '09:00';
    this.newEnd = '09:30';
  }

  confirmAdd() {
    const day = this.addingForDay();
    if (day === null) return;
    this.schedule.update(sched => sched.map(d => d.dayIndex === day
      ? { ...d, slots: [...d.slots, { startTime: this.newStart, endTime: this.newEnd, isAvailable: true }] }
      : d
    ));
    this.addingForDay.set(null);
  }

  cancelAdd() { this.addingForDay.set(null); }

save() {
  this.saving.set(true);

  const slots: ScheduleUpdateRequest['slots'] = [];
  this.schedule().forEach(d => {
    d.slots.forEach(s => {
      // Ajouter :00 si le format est HH:mm (Java LocalTime attend HH:mm:ss)
      const start = s.startTime.length === 5 ? s.startTime + ':00' : s.startTime;
      const end = s.endTime.length === 5 ? s.endTime + ':00' : s.endTime;

      slots.push({
        dayOfWeek: d.dayKey,
        startTime: start,
        endTime: end,
        available: s.isAvailable
      });
    });
  });

  this.svc.updateSchedule({ slots }).subscribe({
    next: res => {
      this.buildSchedule(res.data);
      this.saving.set(false);
    },
    error: (err) => {
      console.error('Erreur sauvegarde planning:', err);
      this.saving.set(false);
    }
  });
}

  getDayName(idx: number) { return this.days[idx]?.name ?? ''; }

  private buildSchedule(backendSlots: TimeSlot[]) {
    const sched: DaySchedule[] = this.days.map((d, i) => ({
      dayIndex: i,
      dayKey: d.key,
      dayName: d.name,
      dayShort: d.short,
      slots: [],
    }));

    backendSlots.forEach(s => {
      // Match backend dayOfWeek string to our index
      const dayIdx = this.days.findIndex(d => d.key === s.dayOfWeek);
      if (dayIdx >= 0) {
        sched[dayIdx].slots.push({
          startTime: s.startTime,
          endTime: s.endTime,
          isAvailable: s.available,
          id: s.id
        });
      }
    });

    // Sort slots by startTime within each day
    sched.forEach(d => d.slots.sort((a, b) => a.startTime.localeCompare(b.startTime)));

    this.schedule.set(sched);
  }

  
}