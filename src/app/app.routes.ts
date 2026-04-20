import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/guards-guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'psychologist',
    loadChildren: () => import('./features/psychologist/psychologist.routes').then(m => m.psychologistRoutes),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PSYCHOLOGIST'] },
  },
  {
    path: 'consultation/room/:roomId',
    loadComponent: () =>
      import('./features/Consultation/video-call/video-call.component').then(
        m => m.VideoCallComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['STUDENT', 'PSYCHOLOGIST'],
      fullScreen: true,
    },
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];

