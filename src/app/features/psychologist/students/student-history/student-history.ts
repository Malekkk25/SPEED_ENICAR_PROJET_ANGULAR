import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import {
  PsychologistService,
  ConfidentialRecord,
  Appointment,
} from '../../../../core/services/psychologist';

import { DocumentService } from '../../../../core/services/Document.service';

export interface MedicalDocument {
  id: number;
  fileName: string;
  status: string;
  createdAt: string;
  fileSize?: number;
  fileType?: string;
  studentId?: number;
  studentName?: string;
  rejectionReason?: string;
}

@Component({
  selector: 'app-student-history',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './student-history.html',
  styleUrl: './student-history.css',
})
export class StudentHistoryComponent implements OnInit {
  private svc = inject(PsychologistService);
  private documentService = inject(DocumentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  studentId = 0;
  studentName = signal('');
  studentDepartment = signal('');
  studentLevel = signal('');
  
  records = signal<ConfidentialRecord[]>([]);
  appointments = signal<Appointment[]>([]);
  documents = signal<MedicalDocument[]>([]);
  
  loading = signal(true);
  selectedDoc = signal<MedicalDocument | null>(null);
  isLoadingDoc = signal(false);
  filePreviewUrl = signal<SafeResourceUrl | null>(null);
  previewType = signal<'pdf' | 'image' | 'other'>('other');
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.studentId = Number(this.route.snapshot.paramMap.get('id') || 0);

    // Charger les fiches & infos étudiant
    this.svc.getStudentRecords(this.studentId, 0, 50).subscribe({
      next: res => {
        const content = res.data?.content || [];
        this.records.set(content);
        if (content.length > 0) {
          this.studentName.set(content[0].studentName);
          this.studentDepartment.set(content[0].studentDepartment);
          this.studentLevel.set(content[0].studentLevel);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    // Charger les RDV
    this.svc.getAppointments(0, 100).subscribe({
      next: res => {
        const studentAppts = (res.data?.content || []).filter(a => a.studentId === this.studentId);
        this.appointments.set(studentAppts);
        // Si pas d'infos depuis les fiches, utiliser les RDV
        if (!this.studentName() && studentAppts.length > 0) {
          this.studentName.set(studentAppts[0].studentName);
          this.studentDepartment.set(studentAppts[0].studentDepartment);
        }
      }
    });

    // Charger les Documents
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentService.getStudentDocuments(this.studentId).subscribe({
      next: (res: any) => {
        const rawData = res.data || res;
        this.documents.set(Array.isArray(rawData) ? rawData : []);
      },
      error: err => console.error('Erreur documents:', err)
    });
  }

  // --- LABELS & STYLES ---
  riskLabel = (l: string) => ({ LOW: 'Faible', MODERATE: 'Modéré', HIGH: 'Élevé', CRITICAL: 'Critique' }[l] || l);
  statusLabel = (s: string) => ({ PENDING: 'En attente', CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé' }[s] || s);
  docStatusLabel = (s: string) => ({ PENDING: '⏳ En attente', VALIDATED: '✅ Validé', REJECTED: '❌ Refusé' }[s] || s);
  typeLabel = (t: string) => ({ INDIVIDUAL: 'Individuel', GROUP: 'Groupe', URGENT: 'Urgent' }[t] || t);
  
  initial(): string {
    const name = this.studentName();
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  openDocument(doc: MedicalDocument) {
    this.selectedDoc.set(doc);
    this.isLoadingDoc.set(true);
    this.filePreviewUrl.set(null);
    this.errorMessage.set(null);

    const type = (doc.fileType || '').toLowerCase();
    this.previewType.set(type.includes('pdf') ? 'pdf' : 
      (type.includes('image') || type.includes('jpeg') || type.includes('png') || type.includes('jpg')) ? 'image' : 'other');

    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob: Blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        this.filePreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl));
        this.isLoadingDoc.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger le fichier.');
        this.isLoadingDoc.set(false);
      }
    });
  }

  closeDocument() {
    this.selectedDoc.set(null);
    this.filePreviewUrl.set(null);
    if (this.filePreviewUrl()) {
      window.URL.revokeObjectURL(this.filePreviewUrl() as string);
    }
  }

  newRecord() {
    this.router.navigate(['/psychologist/records/new'], { queryParams: { studentId: this.studentId } });
  }
}