import { Routes } from '@angular/router';

export const scolarityRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/scolarity-shell/scolarity-shell')
        .then(m => m.ScolarityShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard')
            .then(m => m.ScolarityDashboardComponent),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./students/students')
            .then(m => m.StudentsComponent),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./documents/documents')
            .then(m => m.DocumentsComponent),
      },
      {
        path: 'absences',
        loadComponent: () =>
          import('./absences/absences')
            .then(m => m.AbsencesComponent),
      },
      {
        path: 'analysis',
        loadComponent: () =>
          import('./analysis/analysis')
            .then(m => m.AnalysisComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];