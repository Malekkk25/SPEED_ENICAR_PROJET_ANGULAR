import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/environment'; // ⚠️ Adapte le chemin selon ton projet

// ⚠️ N'oublie pas d'importer tes interfaces (ajuste le chemin si besoin)
import { MedicalDocumentResponse, ApiResponse } from '../services/student'; 

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  
  // L'URL de base qui pointe vers ton nouveau DocumentController unifié
  private apiUrl = `${environment.apiUrl}/documents`;

  // ─────────────────────────────────────────────
  // ACTIONS POUR L'ÉTUDIANT
  // ─────────────────────────────────────────────

  /**
   * Uploader un nouveau document (Utilise FormData pour l'envoi de fichier)
   */
 uploadDocument(file: File, type: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return this.http.post(`${this.apiUrl}/upload`, formData); // ✅ Va maintenant à /api/documents/upload
  }
  // ─────────────────────────────────────────────
  // ACTIONS POUR LE PSYCHOLOGUE
  // ─────────────────────────────────────────────

  /**
   * Récupérer les documents d'un étudiant spécifique
   */
  getStudentDocuments(studentId: number): Observable<ApiResponse<MedicalDocumentResponse[]>> {
    return this.http.get<ApiResponse<MedicalDocumentResponse[]>>(`${this.apiUrl}/student/${studentId}`);
  }

  // ─────────────────────────────────────────────
  // ACTION COMMUNE (TÉLÉCHARGEMENT)
  // ─────────────────────────────────────────────

  /**
   * Télécharger un document par son ID (Résout l'erreur 400 Bad Request)
   */
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      // ⚠️ C'EST LA PARTIE LA PLUS IMPORTANTE
      // Ça dit à Angular : "Ne parse pas ça comme du JSON, c'est un fichier !"
      responseType: 'blob' 
    });
  }
  // Dans document.service.ts
  getMyDocuments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-documents`);
  }
}