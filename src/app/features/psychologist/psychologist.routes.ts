import { Routes } from '@angular/router';import { PsychologistShellComponent } from './shared/psychologist-shell/psychologist-shell';
export const psychologistRoutes: Routes = [
  {
    path: '',
    component: PsychologistShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('../dashboard/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'appointments',
        loadComponent: () => import('./appointments/appointment-list/appointment-list').then(m => m.AppointmentListComponent),
      },
      {
        path: 'appointments/:id',
        loadComponent: () => import('./appointments/appointment-detail/appointment-detail').then(m => m.AppointmentDetailComponent),
      },
      {
        path: 'students',
        loadComponent: () => import('./students/student-overview/student-overview').then(m => m.StudentOverviewComponent),
      },
      {
        path: 'students/:id',
        loadComponent: () => import('./students/student-history/student-history').then(m => m.StudentHistoryComponent),
      },
      {
        path: 'records',
        loadComponent: () => import('./records/record-list/record-list').then(m => m.RecordListComponent),
      },
      {
        path: 'records/new',
        loadComponent: () => import('./records/record-form/record-form').then(m => m.RecordFormComponent),
      },
      {
        path: 'records/:id',
        loadComponent: () => import('./records/record-detail/record-detail').then(m => m.RecordDetailComponent),
      },
      {
        path: 'alerts',
        loadComponent: () => import('./alerts/alert-list/alert-list').then(m => m.AlertListComponent),
      },
      {
        path: 'alerts/:id',
        loadComponent: () => import('./alerts/alert-detail/alert-detail').then(m => m.AlertDetailComponent),
      },
      {
        path: 'schedule',
        loadComponent: () => import('./schedule/schedule').then(m => m.ScheduleComponent),
      },
    ],
  },
];
