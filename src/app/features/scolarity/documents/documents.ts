import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScolarityService } from '../services/scolarity.service';
import { MedicalDocument } from '../models/scolarity.models';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class DocumentsComponent implements OnInit {
  private service = inject(ScolarityService);

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
      next: (docs) => { this.documents.set(docs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  validate(id: number) {
    this.processingId.set(id);
    this.service.validateDocument(id).subscribe({
      next: () => { this.loadDocuments(); this.processingId.set(null); },
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
      next: () => { this.loadDocuments(); this.cancelReject(); },
      error: () => this.cancelReject()
    });
  }

  onReasonChange(event: Event) {
    this.rejectReason.set((event.target as HTMLTextAreaElement).value);
  }
}