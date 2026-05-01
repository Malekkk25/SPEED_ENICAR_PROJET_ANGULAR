import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedicalDocument, PsychologistService } from '../../../core/services/psychologist';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class DocumentsComponent implements OnInit {
  
  private service = inject(PsychologistService);

  documents = signal<MedicalDocument[]>([]);
  loading = signal(true);
  processingId = signal<number | null>(null);
  rejectingId = signal<number | null>(null);
  rejectReason = signal('');

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading.set(true);
    this.service.getPendingDocuments().subscribe({
      // ✅ CORRECTION : On utilise response.data pour récupérer le tableau
      next: (response: any) => { 
        // Par sécurité, on vérifie si .data existe, sinon on prend la réponse directe
        const docs = response.data !== undefined ? response.data : response;
        this.documents.set(docs); 
        this.loading.set(false); 
      },
      error: (err) => {
        console.error('Erreur chargement documents:', err);
        this.loading.set(false);
      }
    });
  }

  validate(id: number) {
    this.processingId.set(id);
    this.service.validateDocument(id).subscribe({
      next: () => { 
        this.loadDocuments(); 
        this.processingId.set(null); 
      },
      error: () => this.processingId.set(null)
    });
  }

  startReject(id: number) {
    this.rejectingId.set(id);
    this.rejectReason.set('');
  }

  cancelReject() {
    this.rejectingId.set(null);
    this.rejectReason.set('');
  }

  confirmReject(id: number) {
    if (!this.rejectReason().trim()) return;
    
    this.service.rejectDocument(id, this.rejectReason()).subscribe({
      next: () => { 
        this.loadDocuments(); 
        this.cancelReject(); 
      },
      error: () => this.cancelReject()
    });
  }

  onReasonChange(event: Event) {
    this.rejectReason.set((event.target as HTMLTextAreaElement).value);
  }
}