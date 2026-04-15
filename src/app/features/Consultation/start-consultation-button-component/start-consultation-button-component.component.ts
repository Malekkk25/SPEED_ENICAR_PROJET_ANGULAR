// src/app/features/appointment/components/start-consultation-button/start-consultation-button.component.ts
//
// À intégrer dans votre composant de détail de rendez-vous existant.

import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConsultationService } from '../../../core/services/consultation-service.service';
import { AuthService } from '../../../core/services/auth';


@Component({
  selector: 'app-start-consultation-button',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './start-consultation-button-component.component.html',
  styleUrls: ['./start-consultation-button-component.component.css']
})
export class StartConsultationButtonComponent {
  @Input({ required: true }) appointmentId!: number;
  @Input() existingRoomId?: string; // Pré-rempli si la session existe déjà

  private readonly consultationSvc = inject(ConsultationService);
  private readonly authService     = inject(AuthService);
  private readonly router          = inject(Router);
  private readonly snackBar        = inject(MatSnackBar);

  loading = signal(false);
  roomId  = signal<string | undefined>(this.existingRoomId);
  role    = this.authService.getRole();

  async createAndJoin(): Promise<void> {
    this.loading.set(true);
    try {
      const session = await this.consultationSvc.createSession(this.appointmentId).toPromise();
      this.roomId.set(session!.roomId);
      this.router.navigate(['/consultation/room', session!.roomId]);
    } catch (err: any) {
      // Si la session existe déjà, récupérer le roomId
      if (err?.status === 400 && err?.error?.message?.includes('roomId')) {
        const match = err.error.message.match(/roomId: ([\w-]+)/);
        if (match) {
          this.router.navigate(['/consultation/room', match[1]]);
          return;
        }
      }
      this.snackBar.open(
        err?.error?.message ?? 'Impossible de créer la session vidéo',
        'Fermer', { duration: 4000 }
      );
    } finally {
      this.loading.set(false);
    }
  }

  joinRoom(): void {
    if (this.roomId()) {
      this.router.navigate(['/consultation/room', this.roomId()]);
    }
  }
}