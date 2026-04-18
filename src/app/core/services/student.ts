import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment';
import { ApiResponse } from './auth';

// ── Interfaces ───────────────────────────────────────────

export interface MoodEntry {
  id: number;
  moodLevel: number;
  moodLabel: string;
  emoji: string;
  note: string;
  date: string;
  activities: string;
  createdAt: string;
}

export interface MoodStats {
  average: number;
  negativeCount: number;
  totalEntries: number;
  period: string;
  startDate: string;
  endDate: string;
  distribution: { moodLevel: number; count: number }[];
}

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicRecord {
  id: number;
  subject: string;
  grade: number;
  maxGrade: number;
  percentage: number;
  isPassing: boolean;
  semester: string;
  academicYear: string;
  coefficient: number;
}

export interface Absence {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  justified: boolean;
  subject: string;
  reportedBy: string;
  durationInDays: number;
  isProlonged: boolean;
  createdAt: string;
}

export interface StudentProfile {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  department: string;
  level: string;
  enrollmentYear: number;
  dateOfBirth: string;
  averageGrade: number;
  unjustifiedAbsences: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ── Service ──────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class StudentService {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/student`;

  // ── Profil ───────────────────────────────────────────

  getProfile(): Observable<ApiResponse<StudentProfile>> {
    return this.http.get<ApiResponse<StudentProfile>>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<StudentProfile>): Observable<ApiResponse<StudentProfile>> {
    return this.http.put<ApiResponse<StudentProfile>>(`${this.apiUrl}/profile`, data);
  }

  getProfileStats(): Observable<ApiResponse<StudentProfile>> {
    return this.http.get<ApiResponse<StudentProfile>>(`${this.apiUrl}/profile/stats`);
  }

  // ── Mood Tracker ─────────────────────────────────────

  getMoods(page = 0, size = 20): Observable<ApiResponse<Page<MoodEntry>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<ApiResponse<Page<MoodEntry>>>(`${this.apiUrl}/moods`, { params });
  }

  createMood(mood: Partial<MoodEntry>): Observable<ApiResponse<MoodEntry>> {
    return this.http.post<ApiResponse<MoodEntry>>(`${this.apiUrl}/moods`, mood);
  }

  getMoodStats(period: 'week' | 'month' = 'week'): Observable<ApiResponse<MoodStats>> {
    const params = new HttpParams().set('period', period);
    return this.http.get<ApiResponse<MoodStats>>(`${this.apiUrl}/moods/stats`, { params });
  }

  deleteMood(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/moods/${id}`);
  }

  // ── Journal ──────────────────────────────────────────

  getJournalEntries(page = 0, size = 10): Observable<ApiResponse<Page<JournalEntry>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<ApiResponse<Page<JournalEntry>>>(`${this.apiUrl}/journal`, { params });
  }

  createJournalEntry(entry: Partial<JournalEntry>): Observable<ApiResponse<JournalEntry>> {
    return this.http.post<ApiResponse<JournalEntry>>(`${this.apiUrl}/journal`, entry);
  }

  updateJournalEntry(id: number, entry: Partial<JournalEntry>): Observable<ApiResponse<JournalEntry>> {
    return this.http.put<ApiResponse<JournalEntry>>(`${this.apiUrl}/journal/${id}`, entry);
  }

  deleteJournalEntry(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/journal/${id}`);
  }

  // ── Académique ───────────────────────────────────────

  getGrades(semester?: string): Observable<ApiResponse<AcademicRecord[]>> {
    let params = new HttpParams();
    if (semester) params = params.set('semester', semester);
    return this.http.get<ApiResponse<AcademicRecord[]>>(`${this.apiUrl}/grades`, { params });
  }

  getAverage(semester?: string): Observable<ApiResponse<{ average: number }>> {
    let params = new HttpParams();
    if (semester) params = params.set('semester', semester);
    return this.http.get<ApiResponse<{ average: number }>>(`${this.apiUrl}/grades/average`, { params });
  }

  // ── Absences ─────────────────────────────────────────

  getAbsences(page = 0, size = 20): Observable<ApiResponse<Page<Absence>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<ApiResponse<Page<Absence>>>(`${this.apiUrl}/absences`, { params });
  }

  getUnjustifiedAbsences(): Observable<ApiResponse<Absence[]>> {
    return this.http.get<ApiResponse<Absence[]>>(`${this.apiUrl}/absences/unjustified`);
  }

  getAbsencesCount(): Observable<ApiResponse<{ unjustifiedCount: number }>> {
    return this.http.get<ApiResponse<{ unjustifiedCount: number }>>(`${this.apiUrl}/absences/count`);
  }
}