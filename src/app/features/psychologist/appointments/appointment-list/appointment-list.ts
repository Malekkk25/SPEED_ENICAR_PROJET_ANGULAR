import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PsychologistService,
  Appointment,
  Page
}  from '../../../../core/services/psychologist';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css',
})
export class AppointmentListComponent implements OnInit {
  private svc = inject(PsychologistService);

  allAppointments = signal<Appointment[]>([]);
  pendingList = signal<Appointment[]>([]);
  todayList = signal<Appointment[]>([]);
  page = signal<Page<Appointment> | null>(null);
  totalElements = signal(0);
  activeFilter = signal<string>('ALL');
  selectedType = signal<string>('');
  currentPage = 0;
  pageSize = 20;
  loading = signal(true);

  // Reactive filtered list — reacts to tab + type changes
  appointments = computed(() => {
    let list: Appointment[];
    switch (this.activeFilter()) {
      case 'TODAY': list = this.todayList(); break;
      case 'PENDING': list = this.pendingList(); break;
      default: list = this.allAppointments(); break;
    }
    const type = this.selectedType();
    if (type) {
      list = list.filter(a => a.type === type);
    }
    return list;
  });

  get statusFiltersWithCount() {
    return [
      { label: 'Tous', value: 'ALL', count: this.totalElements() },
      { label: 'Aujourd\'hui', value: 'TODAY', count: this.todayList().length },
      { label: 'En attente', value: 'PENDING', count: this.pendingList().length },
    ];
  }

  ngOnInit() {
    this.loadAll();
    this.loadPending();
    this.loadToday();
  }

  load() { this.loadAll(); }

  loadAll(page = 0) {
    this.loading.set(true);
    this.svc.getAppointments(page, this.pageSize).subscribe({
      next: res => {
        this.allAppointments.set(res.data.content);
        this.page.set(res.data);
        this.totalElements.set(res.data.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadPending() {
    this.svc.getPendingRequests().subscribe({
      next: res => this.pendingList.set(res.data)
    });
  }

  loadToday() {
    this.svc.getTodayAppointments().subscribe({
      next: res => this.todayList.set(res.data)
    });
  }

  setFilter(v: string) {
    this.activeFilter.set(v);
    this.currentPage = 0;
  }

  onTypeChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedType.set(val);
  }

  prevPage() {
    if (this.currentPage > 0) { this.currentPage--; this.loadAll(this.currentPage); }
  }

  nextPage() {
    this.currentPage++;
    this.loadAll(this.currentPage);
  }

  confirm(a: Appointment) {
    this.svc.confirmAppointment(a.id).subscribe({
      next: () => { this.loadAll(this.currentPage); this.loadPending(); this.loadToday(); }
    });
  }

  cancel(a: Appointment) {
    this.svc.cancelAppointment(a.id, 'Annule par le psychologue').subscribe({
      next: () => { this.loadAll(this.currentPage); this.loadPending(); }
    });
  }

  complete(a: Appointment) {
    this.svc.completeAppointment(a.id).subscribe({
      next: () => { this.loadAll(this.currentPage); this.loadToday(); }
    });
  }

  initial(a: Appointment): string {
    if (!a.studentName) return '??';
    const p = a.studentName.split(' ');
    return p.length >= 2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : a.studentName.substring(0, 2).toUpperCase();
  }

  typeLabel(t: string): string {
    return ({ INITIAL: 'Initiale', FOLLOW_UP: 'Suivi', URGENT: 'Urgent' } as Record<string, string>)[t] ?? t;
  }

  statusLabel(s: string): string {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirme', COMPLETED: 'Termine', CANCELLED: 'Annule' } as Record<string, string>)[s] ?? s;
  }
}
