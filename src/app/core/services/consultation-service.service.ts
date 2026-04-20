// src/app/features/consultation/services/consultation.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 👈 N'oublie pas HttpHeaders
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../enviroments/environment';
import { ConsultationSession } from '../models';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/consultations`;

  // 👇 1. On crée une méthode pour générer le header avec le token
  private getAuthHeaders(): HttpHeaders {
    // ⚠️ ATTENTION : Vérifie que ton token s'appelle bien 'token' ou 'jwt' dans ton LocalStorage
    // Si tu utilises un AuthService pour stocker le token, appelle-le ici.
    const token = localStorage.getItem('token'); // ou 'access_token', etc.
    
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  /** Psychologue : créer une session pour un appointment confirmé */
  createSession(appointmentId: number): Observable<ConsultationSession> {
    return this.http
      .post<ApiResponse<ConsultationSession>>(
        this.apiUrl, 
        { appointmentId },
        { headers: this.getAuthHeaders() } // 👇 2. On injecte le header ici !
      )
      .pipe(map(r => r.data));
  }

  /** Récupérer une session par roomId */
  getSession(roomId: string): Observable<ConsultationSession> {
    return this.http
      .get<ApiResponse<ConsultationSession>>(
        `${this.apiUrl}/room/${roomId}`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(map(r => r.data));
  }

  /** Récupérer la session d'un appointment */
  getSessionByAppointment(appointmentId: number): Observable<ConsultationSession> {
    return this.http
      .get<ApiResponse<ConsultationSession>>(
        `${this.apiUrl}/appointment/${appointmentId}`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(map(r => r.data));
  }

  /** Signaler qu'on a rejoint la salle */
  joinSession(roomId: string): Observable<ConsultationSession> {
    return this.http
      .post<ApiResponse<ConsultationSession>>(
        `${this.apiUrl}/room/${roomId}/join`, 
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(map(r => r.data));
  }

  /** Terminer la session */
  endSession(roomId: string): Observable<ConsultationSession> {
    return this.http
      .post<ApiResponse<ConsultationSession>>(
        `${this.apiUrl}/room/${roomId}/end`, 
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(map(r => r.data));
  }
}