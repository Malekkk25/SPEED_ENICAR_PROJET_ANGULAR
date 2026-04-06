import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-psychologist-shell',
   standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],

  templateUrl: './psychologist-shell.html',
  styleUrl: './psychologist-shell.css',
})
export class PsychologistShellComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  user = computed(() => this.auth.getCurrentUser());
  fullName = computed(() => {
    const u = this.user();
    return u ? `Dr. ${u.firstName} ${u.lastName}` : '';
  });
  initials = computed(() => {
    const u = this.user();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : 'PS';
  });

  navItems: NavItem[] = [
    { path: '/psychologist/dashboard', label: 'Tableau de bord', icon: this.icon('dashboard') },
    { path: '/psychologist/appointments', label: 'Rendez-vous', icon: this.icon('calendar'), badge: 3 },
    { path: '/psychologist/students', label: 'Étudiants suivis', icon: this.icon('users') },
    { path: '/psychologist/records', label: 'Fiches confidentielles', icon: this.icon('lock') },
    { path: '/psychologist/alerts', label: 'Alertes', icon: this.icon('bell'), badge: 2 },
    { path: '/psychologist/schedule', label: 'Mon planning', icon: this.icon('clock') },
  ];

  logout() { this.auth.logout(); }

  private icon(name: string): string {
    const icons: Record<string, string> = {
      dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
      calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
      clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    };
    return icons[name] ?? '';
  }
}

