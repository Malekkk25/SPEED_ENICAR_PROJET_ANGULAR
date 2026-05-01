import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';

// ── Interfaces alignées avec le backend Spring Boot ───────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  status: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface MedicalDocument {
  id: number;
  studentId: number;
  studentName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  validationDate?: string;
}

export interface PsychologistDashboard {
  psychologistName: string;
  specialization: string;
  officeLocation: string;
  todayAppointments: number;
  pendingRequests: number;
  totalPatients: number;
  criticalAlerts: number;
  pendingFollowUps: number;
  weekSessions: number;
  monthSessions: number;
}

export interface TimeSlot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
  durationMinutes: number;
}

export interface ScheduleUpdateRequest {
  slots: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    available?: boolean;
  }[];
}

export interface Appointment {
  id: number;
  studentId: number;
  studentName: string;
  studentDepartment: string;
  psychologistId: number;
  psychologistName: string;
  dateTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  type: 'INITIAL' | 'FOLLOW_UP' | 'URGENT';
  reason?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface ConfidentialRecord {
  id: number;
  studentId: number;
  studentName: string;
  studentDepartment: string;
  studentLevel: string;
  sessionDate: string;
  observations: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommendations?: string;
  followUpRequired: boolean;
  nextSessionDate?: string;
  sessionDurationMinutes: number;
  interventions?: string;
  studentProgress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecordRequest {
  studentId: number;
  sessionDate: string;
  observations: string;
  riskLevel?: string;
  recommendations?: string;
  followUpRequired?: boolean;
  nextSessionDate?: string;
  sessionDurationMinutes?: number;
  interventions?: string;
  studentProgress?: string;
}

export interface UpdateRecordRequest {
  observations?: string;
  riskLevel?: string;
  recommendations?: string;
  followUpRequired?: boolean;
  nextSessionDate?: string;
  sessionDurationMinutes?: number;
  interventions?: string;
  studentProgress?: string;
}

export interface StudentAlert {
  studentId: number;
  studentName: string;
  department: string;
  level: string;
  currentRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  lastSessionDate?: string;
  recentMoodAverage?: number;
  unjustifiedAbsences: number;
  academicAverage: number;
  followUpRequired: boolean;
  alertReasons: string[];
}

// ── Service ─────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PsychologistService {

  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/psychologist`;

  // ── Dashboard ─────────────────────────────────────
  getDashboard(): Observable<ApiResponse<PsychologistDashboard>> {
    return this.http.get<ApiResponse<PsychologistDashboard>>(`${this.api}/dashboard`);
  }

  // ── Schedule ──────────────────────────────────────
  getSchedule(): Observable<ApiResponse<TimeSlot[]>> {
    return this.http.get<ApiResponse<TimeSlot[]>>(`${this.api}/schedule`);
  }

  updateSchedule(req: ScheduleUpdateRequest): Observable<ApiResponse<TimeSlot[]>> {
    return this.http.put<ApiResponse<TimeSlot[]>>(`${this.api}/schedule`, req);
  }

  getAvailableSlots(psychologistId: number, day: string): Observable<ApiResponse<TimeSlot[]>> {
    const params = new HttpParams()
      .set('psychologistId', psychologistId)
      .set('day', day);
    return this.http.get<ApiResponse<TimeSlot[]>>(`${this.api}/schedule/available`, { params });
  }

  // ── Appointments ──────────────────────────────────
  getAppointments(page = 0, size = 20): Observable<ApiResponse<Page<Appointment>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<ApiResponse<Page<Appointment>>>(`${this.api}/appointments`, { params });
  }

  getTodayAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.api}/appointments/today`);
  }

  getPendingRequests(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.api}/appointments/pending`);
  }

  confirmAppointment(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.api}/appointments/${id}/confirm`, {});
  }

  cancelAppointment(id: number, reason?: string): Observable<ApiResponse<Appointment>> {
    let params = new HttpParams();
    if (reason) params = params.set('reason', reason);
    return this.http.put<ApiResponse<Appointment>>(`${this.api}/appointments/${id}/cancel`, {}, { params });
  }

  completeAppointment(id: number, notes?: string): Observable<ApiResponse<Appointment>> {
    let params = new HttpParams();
    if (notes) params = params.set('notes', notes);
    return this.http.put<ApiResponse<Appointment>>(`${this.api}/appointments/${id}/complete`, {}, { params });
  }

  // ── Records ───────────────────────────────────────
  getAllRecords(page = 0, size = 15): Observable<ApiResponse<Page<ConfidentialRecord>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<ApiResponse<Page<ConfidentialRecord>>>(`${this.api}/records`, { params });
  }

  getStudentRecords(studentId: number, page = 0, size = 10): Observable<ApiResponse<Page<ConfidentialRecord>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<ApiResponse<Page<ConfidentialRecord>>>(`${this.api}/records/student/${studentId}`, { params });
  }

  createRecord(req: CreateRecordRequest): Observable<ApiResponse<ConfidentialRecord>> {
    return this.http.post<ApiResponse<ConfidentialRecord>>(`${this.api}/records`, req);
  }

  updateRecord(id: number, req: UpdateRecordRequest): Observable<ApiResponse<ConfidentialRecord>> {
    return this.http.put<ApiResponse<ConfidentialRecord>>(`${this.api}/records/${id}`, req);
  }

  getPendingFollowUps(): Observable<ApiResponse<ConfidentialRecord[]>> {
    return this.http.get<ApiResponse<ConfidentialRecord[]>>(`${this.api}/records/follow-ups`);
  }

  deleteRecord(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/records/${id}`);
  }

  // ── Alerts ────────────────────────────────────────
  getStudentsAtRisk(): Observable<ApiResponse<StudentAlert[]>> {
    return this.http.get<ApiResponse<StudentAlert[]>>(`${this.api}/alerts`);
  }

  // ── Documents Médicaux ─────────────────────────────
  getPendingDocuments(): Observable<ApiResponse<MedicalDocument[]>> {
    return this.http.get<ApiResponse<MedicalDocument[]>>(`${this.api}/documents/pending`);
  }

  validateDocument(id: number): Observable<ApiResponse<MedicalDocument>> {
    return this.http.put<ApiResponse<MedicalDocument>>(`${this.api}/documents/${id}/validate`, {});
  }

  rejectDocument(id: number, reason: string): Observable<ApiResponse<MedicalDocument>> {
    return this.http.put<ApiResponse<MedicalDocument>>(`${this.api}/documents/${id}/reject`, { reason });
  }
  // Récupère les documents d'un étudiant spécifique

// Récupère TOUS les documents (Validés, Refusés, En attente) pour un étudiant précis
getStudentMedicalDocuments(studentId: number): Observable<ApiResponse<MedicalDocument[]>> {
  return this.http.get<ApiResponse<MedicalDocument[]>>(`${this.api}/documents/student/${studentId}`);
}
// Récupère le fichier physique (image ou PDF)
downloadDocument(id: number): Observable<Blob> {
  return this.http.get(`${this.api}/documents/${id}/download`, { 
    responseType: 'blob' // 👈 Très important pour les fichiers !
  });
}
// Dans src/app/core/services/psychologist.ts (ou nom similaire)

}