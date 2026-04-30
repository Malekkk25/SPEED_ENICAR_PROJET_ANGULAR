import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalDocumentResponse, StudentService } from '../../../core/services/student';




@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class DocumentsComponent implements OnInit {
  private svc = inject(StudentService);


  uploading = signal(false);
  showForm = signal(false);
  activeFilter = signal<string>('ALL');

  // Formulaire
  selectedFile: File | null = null;
  description = '';

ngOnInit() {
  this.loadDocuments(); // 👈 Indispensable pour remplir le signal au chargement !
}

// Dans ta classe de composant
documents = signal<MedicalDocumentResponse[]>([]); // Initialise avec un tableau vide
loading = signal<boolean>(false);

loadDocuments() {
  this.loading.set(true);
  this.svc.getDocuments().subscribe({
    next: (res) => {
      // res.data contient maintenant bien la liste 
      this.documents.set(res.data); 
      this.loading.set(false);
    },
    error: (err) => {
      console.error('Erreur chargement documents', err);
      this.loading.set(false);
    }
  });
}

  uploadDocument() {
    if (!this.selectedFile) return;
    this.uploading.set(true);

    this.svc.uploadDocument(this.selectedFile, this.description).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.showForm.set(false);
        this.selectedFile = null;
        this.description = '';
        this.loadDocuments(); // Recharge la vraie liste depuis le backend
      },
      error: (err) => {
        console.error('Erreur upload', err);
        this.uploading.set(false);
      }
    });
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