// video-call.component.ts
import {
  Component, OnInit, OnDestroy, inject,
  ViewChild, ElementRef, signal, computed
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ConsultationService } from '../../../core/services/consultation-service.service';
import { WebRtcSignalingService } from '../../../core/services/web-rtc-signaling-service.service';
import { AuthService } from '../../../core/services/auth';
import { ConsultationSession } from '../../../core/models';



type CallState = 'loading' | 'waiting' | 'connecting' | 'active' | 'ended' | 'error';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit, OnDestroy {

  @ViewChild('localVideo')  localVideoRef!:  ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  private readonly route            = inject(ActivatedRoute);
  private readonly router           = inject(Router);
  private readonly consultationSvc  = inject(ConsultationService);
  private readonly signalingService = inject(WebRtcSignalingService);
  private readonly authService      = inject(AuthService);
  private readonly snackBar         = inject(MatSnackBar);

  // ─── State signals ────────────────────────────────────────────────────────
  session   = signal<ConsultationSession | null>(null);
  callState = signal<CallState>('loading');
  videoOn   = signal(true);
  audioOn   = signal(true);
  duration  = signal(0);
  peerName  = signal('');
  errorMsg  = signal('');

  // Initiales calculées
  peerInitials = computed(() => {
    const name = this.peerName();
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  });

  selfInitials = computed(() => {
    const u = this.authService.getCurrentUser();
    if (!u) return 'ME';
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  });

  private roomId!: string;
  private durationInterval?: ReturnType<typeof setInterval>;
  private subs = new Subscription();

  async ngOnInit(): Promise<void> {
  this.roomId = this.route.snapshot.paramMap.get('roomId')!;
  if (!this.roomId) {
    this.callState.set('error');
    this.errorMsg.set('Identifiant de salle invalide.');
    return;
  }

  try {
    // 1. Charger la session
    const sess = await this.consultationSvc.getSession(this.roomId).toPromise();
    this.session.set(sess!);

    if (sess!.status === 'ENDED') {
      this.callState.set('ended');
      return;
    }

    // 2. Init stream UNE SEULE FOIS
    // Si pas de caméra/micro dispo, on essaie audio seul en fallback
    try {
      await this.signalingService.initLocalStream(true, true);
    } catch (mediaErr: any) {
      console.warn('Caméra indisponible, tentative audio seul...', mediaErr);
      try {
        await this.signalingService.initLocalStream(false, true);
        this.videoOn.set(false); // UI reflète que la vidéo est off
      } catch (audioErr) {
        console.warn('Micro aussi indisponible, mode sans média');
        await this.signalingService.initLocalStream(false, false);
        this.videoOn.set(false);
        this.audioOn.set(false);
      }
    }

    // 3. Connexion WebSocket
    this.signalingService.connect(this.roomId);
    this.subscribeToSignaling();

    // 4. Join quand connecté
    const connSub = this.signalingService.connected$.subscribe(async connected => {
      if (connected) {
        const user = this.authService.getCurrentUser()!;
        this.signalingService.sendJoin(`${user.firstName} ${user.lastName}`);
        await this.consultationSvc.joinSession(this.roomId).toPromise();
        this.callState.set('waiting');
      }
    });
    this.subs.add(connSub);

    // 5. Afficher le stream local
    const localSub = this.signalingService.localStream$.subscribe(stream => {
      if (stream && this.localVideoRef) {
        this.localVideoRef.nativeElement.srcObject = stream;
      }
    });
    this.subs.add(localSub);

  } catch (err: any) {
    console.error('💥 Erreur complète attrapée :', err);
    this.callState.set('error');

    // Message d'erreur lisible selon le type
    if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
      this.errorMsg.set('Aucune caméra ou micro détecté sur cet appareil.');
    } else if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
      this.errorMsg.set('Permission refusée. Autorisez l\'accès à la caméra et au micro.');
    } else if (err?.name === 'NotReadableError') {
      this.errorMsg.set('Caméra ou micro déjà utilisé par une autre application.');
    } else {
      this.errorMsg.set(err?.error?.message ?? 'Erreur lors de l\'initialisation.');
    }
  }
}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.signalingService.disconnect();
    clearInterval(this.durationInterval);
  }

  private subscribeToSignaling(): void {

  // Je suis le 2ème arrivé → je crée l'offre
  this.subs.add(this.signalingService.onPeerJoin$.subscribe(async peer => {
    this.peerName.set(peer.peerName);
    this.callState.set('connecting');
    await this.signalingService.createOffer();
  }));

  // Quelqu'un arrive après moi → je mets à jour son nom, j'attends son offre
  this.subs.add(this.signalingService.onPeerArrived$.subscribe(peer => {
    this.peerName.set(peer.peerName);
    this.callState.set('connecting');
    // Pas de createOffer() ici — le nouveau arrivant va recevoir peer-present
    // et créer l'offre lui-même
  }));

  // Je reçois une offre → je réponds
  this.subs.add(this.signalingService.onOffer$.subscribe(async offer => {
    this.callState.set('connecting');
    await this.signalingService.handleOffer(offer);
  }));

  this.subs.add(this.signalingService.onAnswer$.subscribe(async answer => {
    await this.signalingService.handleAnswer(answer);
  }));

  this.subs.add(this.signalingService.onIce$.subscribe(async candidate => {
    await this.signalingService.addIceCandidate(candidate);
  }));

  this.subs.add(this.signalingService.remoteStream$.subscribe(stream => {
    if (stream && this.remoteVideoRef) {
      this.remoteVideoRef.nativeElement.srcObject = stream;
      this.callState.set('active');
      this.startDurationTimer();
    }
  }));

  this.subs.add(this.signalingService.onPeerLeave$.subscribe(() => {
    this.snackBar.open(
      `${this.peerName() || 'Le participant'} a quitté l'appel`, '✕',
      { duration: 4000 }
    );
    this.callState.set('waiting');
    if (this.remoteVideoRef)
      this.remoteVideoRef.nativeElement.srcObject = null;
  }));
}

  // ─── Controls ─────────────────────────────────────────────────────────────
  toggleVideo(): void { const v = !this.videoOn(); this.videoOn.set(v); this.signalingService.toggleVideo(v); }
  toggleAudio(): void { const a = !this.audioOn(); this.audioOn.set(a); this.signalingService.toggleAudio(a); }

  async hangUp(): Promise<void> {
    try { await this.consultationSvc.endSession(this.roomId).toPromise(); }
    finally {
      this.signalingService.disconnect();
      clearInterval(this.durationInterval);
      this.callState.set('ended');
      setTimeout(() => this.router.navigate(['/psychologist/appointments', this.session()?.appointmentId]), 2500);
    }
  }

  goBack(): void { this.router.navigate(['/psychologist/appointments']); }

  private startDurationTimer(): void {
    if (this.durationInterval) return;
    this.durationInterval = setInterval(() => this.duration.update(d => d + 1), 1000);
  }

  get formattedDuration(): string {
    const d = this.duration();
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = d % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}