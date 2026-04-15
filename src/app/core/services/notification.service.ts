// src/app/core/notifications/services/notification.service.ts
// ⚠️ MISE À JOUR de votre NotificationService existant
// Ajouter la gestion des notifications de consultation vidéo

import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth';
import { AppNotification, ConsultationNotificationData } from '../models';
import { environment } from '../../../enviroments/environment';


@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly snackBar    = inject(MatSnackBar);

  // ─── State ──────────────────────────────────────────────────────────────────
  readonly notifications$  = new BehaviorSubject<AppNotification[]>([]);
  readonly unreadCount$    = new BehaviorSubject<number>(0);
  readonly newNotification$ = new Subject<AppNotification>();

  private stompClient!: Client;

  // ─── Connexion WebSocket ──────────────────────────────────────────────────

  connect(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.stompClient = new Client({
      webSocketFactory: () =>
        new SockJS(environment.wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${this.authService.getAccessToken()}`
      },
      onConnect: () => {
        this.subscribeToNotifications(user.id);
      },
      reconnectDelay: 5000,
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    this.stompClient?.deactivate();
  }

  // ─── Subscription ────────────────────────────────────────────────────────

  private subscribeToNotifications(userId: number): void {
    this.stompClient.subscribe(
      `/topic/notifications/${userId}`,
      (msg: IMessage) => {
        const notification: AppNotification = JSON.parse(msg.body);
        this.handleIncoming(notification);
      }
    );
  }

  // ─── Gestion des notifications entrantes ─────────────────────────────────

  private handleIncoming(notification: AppNotification): void {
    // 1. Ajouter en tête de liste
    const current = this.notifications$.value;
    this.notifications$.next([notification, ...current]);
    this.unreadCount$.next(this.unreadCount$.value + 1);
    this.newNotification$.next(notification);

    // 2. Afficher un snackbar spécifique selon le type
    switch (notification.type) {
      case 'CONSULTATION_SESSION_READY':
        this.showConsultationSnackbar(notification);
        break;
      default:
        this.showDefaultSnackbar(notification);
    }
  }

  // ─── Snackbars ───────────────────────────────────────────────────────────

  private showConsultationSnackbar(notification: AppNotification): void {
    const data = notification.data as ConsultationNotificationData | undefined;
    const snack = this.snackBar.open(
      `📹 ${notification.title}`,
      'Rejoindre',
      {
        duration: 10000,
        panelClass: ['consultation-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top',
      }
    );
    snack.onAction().subscribe(() => {
      if (notification.actionUrl) {
        this.router.navigateByUrl(notification.actionUrl);
      }
    });
  }

  private showDefaultSnackbar(notification: AppNotification): void {
    this.snackBar.open(notification.title, '✕', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  // ─── API REST ────────────────────────────────────────────────────────────

  markAsRead(id: number): void {
    const updated = this.notifications$.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications$.next(updated);
    this.unreadCount$.next(Math.max(0, this.unreadCount$.value - 1));
    // TODO: appel HTTP PATCH /api/v1/notifications/{id}/read
  }

  markAllAsRead(): void {
    const updated = this.notifications$.value.map(n => ({ ...n, read: true }));
    this.notifications$.next(updated);
    this.unreadCount$.next(0);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}