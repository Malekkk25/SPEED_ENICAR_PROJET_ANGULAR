import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student';

export interface MedicalDocument {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  validationDate: string;
  rejectionReason: string;
  createdAt: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class DocumentsComponent implements OnInit {
  private svc = inject(StudentService);

  documents = signal<MedicalDocument[]>([]);
  loading = signal(true);
  uploading = signal(false);
  showForm = signal(false);
  activeFilter = signal<string>('ALL');

  // Formulaire
  selectedFile: File | null = null;
  description = '';

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading.set(true);
    // À connecter avec le service documents
    this.loading.set(false);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  filteredDocuments() {
    if (this.activeFilter() === 'ALL') return this.documents();
    return this.documents().filter(d => d.status === this.activeFilter());
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  uploadDocument() {
    if (!this.selectedFile) return;
    this.uploading.set(true);

    // À connecter avec le service documents
    setTimeout(() => {
      this.uploading.set(false);
      this.showForm.set(false);
      this.selectedFile = null;
      this.description = '';
      this.loadDocuments();
    }, 1000);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'VALIDATED': 'status-confirmed',
      'REJECTED': 'status-cancelled'
    };
    return classes[status] ?? 'status-pending';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': '⏳ En attente',
      'VALIDATED': '✅ Validé',
      'REJECTED': '❌ Rejeté'
    };
    return labels[status] ?? status;
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}