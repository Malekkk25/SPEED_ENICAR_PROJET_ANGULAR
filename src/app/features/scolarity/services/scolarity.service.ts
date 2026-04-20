import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/environment';
import { AuthService } from '../../../core/services/auth';
import { StudentDossier, MedicalDocument, Absence, AnalysisResult, PageResponse } from '../models/scolarity.models';

@Injectable({ providedIn: 'root' })
export class ScolarityService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = environment.apiUrl + '/scolarity';

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.getAccessToken(),
      'Content-Type': 'application/json'
    });
  }

  getStudents(page = 0, size = 20): Observable<PageResponse<StudentDossier>> {
    return this.http.get<PageResponse<StudentDossier>>(
      this.apiUrl + '/students?page=' + page + '&size=' + size,
      { headers: this.headers() }
    );
  }

  getStudentById(id: number): Observable<StudentDossier> {
    return this.http.get<StudentDossier>(
      this.apiUrl + '/students/' + id,
      { headers: this.headers() }
    );
  }

  getPendingDocuments(): Observable<MedicalDocument[]> {
    return this.http.get<MedicalDocument[]>(
      this.apiUrl + '/documents/pending',
      { headers: this.headers() }
    );
  }

  validateDocument(id: number): Observable<MedicalDocument> {
    return this.http.put<MedicalDocument>(
      this.apiUrl + '/documents/' + id + '/validate',
      {},
      { headers: this.headers() }
    );
  }

  rejectDocument(id: number, reason: string): Observable<MedicalDocument> {
    return this.http.put<MedicalDocument>(
      this.apiUrl + '/documents/' + id + '/reject',
      { reason },
      { headers: this.headers() }
    );
  }

  // ── ABSENCES ──────────────────────────────────────

  getProlongedAbsences(days = 3): Observable<Absence[]> {
    return this.http.get<Absence[]>(
      this.apiUrl + '/absences/prolonged?days=' + days,
      { headers: this.headers() }
    );
  }
 justifyAbsence(id: number, justified: boolean): Observable<Absence> {
  return this.http.put<Absence>(
    this.apiUrl + '/absences/' + id + '/justify?justified=' + justified,
    {},
    { headers: this.headers() }
  );
}
createStudent(data: {
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  department: string;
  level: string;
  enrollmentYear: number;
}): Observable<StudentDossier> {
  return this.http.post<StudentDossier>(
    this.apiUrl + '/students',
    data,
    { headers: this.headers() }
  );
}

  // ── ANALYSE IA ────────────────────────────────────

  analyzeStudent(id: number): Observable<AnalysisResult> {
    return this.http.post<AnalysisResult>(
      this.apiUrl + '/analysis/student/' + id,
      {},
      { headers: this.headers() }
    );
  }

  getAtRiskStudents(): Observable<AnalysisResult[]> {
    return this.http.get<AnalysisResult[]>(
      this.apiUrl + '/analysis/at-risk',
      { headers: this.headers() }
    );
  }
}
