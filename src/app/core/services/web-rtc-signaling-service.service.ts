// src/app/features/consultation/services/webrtc-signaling.service.ts

import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth';
import { environment } from '../../../enviroments/environment';

// ─── Signaling types ──────────────────────────────────────────────────────────

export interface PeerPresentPayload {
  peerId: string;
  peerName: string;
}

export type SignalType =
  | 'join'
  | 'leave'
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'peer-present';

export interface SignalMessage {
  type: SignalType;
  roomId: string;
  senderId: string;
  payload?: RTCSessionDescriptionInit | RTCIceCandidateInit | PeerPresentPayload | string;
}


/**
 * Service de signaling WebRTC via STOMP/WebSocket.
 * Le serveur est un simple relais — la connexion vidéo est P2P.
 *
 * ICE Servers utilisés :
 *   - STUN Google (gratuit, pas de compte nécessaire)
 *   - Ajouter un serveur TURN pour les réseaux restrictifs (entreprise/NAT strict)
 */
@Injectable({ providedIn: 'root' })
export class WebRtcSignalingService implements OnDestroy {
  private readonly authService = inject(AuthService);

  // ─── STOMP ──────────────────────────────────────────────────────────────────
  private stompClient!: Client;
  private roomId!: string;

  // ─── Événements de signaling émis vers le composant ─────────────────────────
  readonly onOffer$    = new Subject<RTCSessionDescriptionInit>();
  readonly onAnswer$   = new Subject<RTCSessionDescriptionInit>();
  readonly onIce$      = new Subject<RTCIceCandidateInit>();
  readonly onPeerJoin$ = new Subject<PeerPresentPayload>();
  readonly onPeerLeave$ = new Subject<void>();
  readonly connected$  = new BehaviorSubject<boolean>(false);

  // ─── WebRTC ─────────────────────────────────────────────────────────────────
  private peerConnection!: RTCPeerConnection;
  private localStream!: MediaStream;

  readonly remoteStream$ = new BehaviorSubject<MediaStream | null>(null);
  readonly localStream$  = new BehaviorSubject<MediaStream | null>(null);

  readonly ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // ⚠️ Pour un usage production, ajouter un serveur TURN :
    // { urls: 'turn:your-turn-server.com', username: '...', credential: '...' }
  ];

  // ─── Connexion STOMP ─────────────────────────────────────────────────────────

  connect(roomId: string): void {
    this.roomId = roomId;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${this.authService.getAccessToken()}`
      },
      onConnect: () => {
        this.connected$.next(true);
        this.subscribeToRoom(roomId);
        this.subscribeToPrivateChannel(roomId);
      },
      onDisconnect: () => this.connected$.next(false),
      reconnectDelay: 3000,
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    const senderId = this.authService.getCurrentUser()?.email ?? '';
    this.sendSignal({ type: 'leave', roomId: this.roomId, senderId });
    this.stompClient?.deactivate();
    this.closePeerConnection();
  }

  // ─── Subscriptions STOMP ─────────────────────────────────────────────────────

  private subscribeToRoom(roomId: string): void {
    this.stompClient.subscribe(`/topic/room/${roomId}`, (msg: IMessage) => {
      const signal: SignalMessage = JSON.parse(msg.body);
      const myId = this.authService.getCurrentUser()?.email;
      if (signal.senderId === myId) return; // Ignorer ses propres messages

      this.handleIncomingSignal(signal);
    });
  }

  /** Canal privé : pour recevoir "peer-present" uniquement destiné à moi */
  private subscribeToPrivateChannel(roomId: string): void {
    const myId = this.authService.getCurrentUser()?.email;
    if (!myId) return;
    this.stompClient.subscribe(`/topic/room/${roomId}/user/${myId}`, (msg: IMessage) => {
      const signal: SignalMessage = JSON.parse(msg.body);
      this.handleIncomingSignal(signal);
    });
  }

  // ─── Gestion des signaux entrants ────────────────────────────────────────────

  private handleIncomingSignal(signal: SignalMessage): void {
    switch (signal.type) {
      case 'peer-present':
        // Un pair est déjà présent → je dois initier l'offer
        this.onPeerJoin$.next(signal.payload as PeerPresentPayload);
        break;
      case 'join':
        // Un nouveau participant rejoint → il va initier l'offer lui-même
        this.onPeerJoin$.next({ peerId: signal.senderId, peerName: String(signal.payload) });
        break;
      case 'offer':
        this.onOffer$.next(signal.payload as RTCSessionDescriptionInit);
        break;
      case 'answer':
        this.onAnswer$.next(signal.payload as RTCSessionDescriptionInit);
        break;
      case 'ice-candidate':
        this.onIce$.next(signal.payload as RTCIceCandidateInit);
        break;
      case 'leave':
        this.onPeerLeave$.next();
        break;
    }
  }

  // ─── Envoi de signaux ────────────────────────────────────────────────────────

  sendSignal(message: Partial<SignalMessage>): void {
    if (!this.stompClient?.connected) return;
    this.stompClient.publish({
      destination: `/app/signal/${this.roomId}`,
      body: JSON.stringify({ ...message, roomId: this.roomId }),
    });
  }

  sendOffer(offer: RTCSessionDescriptionInit): void {
    this.sendSignal({ type: 'offer', payload: offer });
  }

  sendAnswer(answer: RTCSessionDescriptionInit): void {
    this.sendSignal({ type: 'answer', payload: answer });
  }

  sendIceCandidate(candidate: RTCIceCandidate): void {
    this.sendSignal({ type: 'ice-candidate', payload: candidate.toJSON() });
  }

  sendJoin(displayName: string): void {
    this.sendSignal({ type: 'join', payload: displayName });
  }

  // ─── WebRTC Peer Connection ──────────────────────────────────────────────────

  async initLocalStream(video = true, audio = true): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
    this.localStream$.next(this.localStream);
    return this.localStream;
  }

  createPeerConnection(): RTCPeerConnection {
    this.peerConnection = new RTCPeerConnection({ iceServers: this.ICE_SERVERS });

    // Ajouter les tracks locaux
    this.localStream.getTracks().forEach(track =>
      this.peerConnection.addTrack(track, this.localStream)
    );

    // Recevoir le stream distant
    this.peerConnection.ontrack = event => {
      const [remoteStream] = event.streams;
      this.remoteStream$.next(remoteStream);
    };

    // Envoyer les ICE candidates via signaling
    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        this.sendIceCandidate(event.candidate);
      }
    };

    return this.peerConnection;
  }

  async createOffer(): Promise<void> {
    const pc = this.createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.sendOffer(offer);
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.sendAnswer(answer);
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (this.peerConnection?.remoteDescription) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  toggleVideo(enabled: boolean): void {
    this.localStream?.getVideoTracks().forEach(t => (t.enabled = enabled));
  }

  toggleAudio(enabled: boolean): void {
    this.localStream?.getAudioTracks().forEach(t => (t.enabled = enabled));
  }

  closePeerConnection(): void {
    this.peerConnection?.close();
    this.localStream?.getTracks().forEach(t => t.stop());
    this.remoteStream$.next(null);
    this.localStream$.next(null);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}