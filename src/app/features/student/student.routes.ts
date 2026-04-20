import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./student-shell/student-shell').then(m => m.StudentShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.StudentDashboardComponent),
      },
      {
        path: 'mood-tracker',
        loadComponent: () => import('./mood-tracker/mood-tracker').then(m => m.MoodTrackerComponent),
      },
      {
        path: 'journal',
        loadComponent: () => import('./journal/journal').then(m => m.JournalComponent),
      },
      {
        path: 'appointments',
        loadComponent: () => import('./appointments/appointments').then(m => m.AppointmentsComponent),
      },
      {
        path: 'academic',
        loadComponent: () => import('./academic/academic').then(m => m.AcademicComponent),
      },
      {
        path: 'absences',
        loadComponent: () => import('./absences/absences').then(m => m.AbsencesComponent),
      },
      {
        path: 'documents',
        loadComponent: () => import('./documents/documents').then(m => m.DocumentsComponent),
      },
      {
        path: 'difficulties',
        loadComponent: () => import('./difficulties/difficulties').then(m => m.DifficultiesComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];