// notification-bell.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { Router }        from '@angular/router';
import { AppNotification } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';


@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent {
  readonly notificationSvc = inject(NotificationService);
  private readonly router  = inject(Router);

  open = signal(false);

  toggleDropdown(): void { this.open.update(v => !v); }

  onNotifClick(notif: AppNotification): void {
    this.notificationSvc.markAsRead(notif.id);
    this.open.set(false);
    if (notif.actionUrl) this.router.navigateByUrl(notif.actionUrl);
  }

  markAllRead(): void { this.notificationSvc.markAllAsRead(); }

  getIconColor(type: string): string {
    const map: Record<string, string> = {
      CONSULTATION_SESSION_READY:   'blue',
      CONSULTATION_SESSION_STARTED: 'green',
      CONSULTATION_SESSION_ENDED:   'gray',
      APPOINTMENT_REMINDER:         'orange',
    };
    return map[type] ?? 'gray';
  }

  getIconPath(type: string): string {
    const map: Record<string, string> = {
      CONSULTATION_SESSION_READY:   '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
      CONSULTATION_SESSION_STARTED: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
      CONSULTATION_SESSION_ENDED:   '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.59a16 16 0 0 0 6.5 6.5l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
      APPOINTMENT_REMINDER:         '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    };
    return map[type] ?? '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>';
  }
}