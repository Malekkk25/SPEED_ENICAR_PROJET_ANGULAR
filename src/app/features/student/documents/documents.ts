import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalDocumentResponse } from '../../../core/services/student'; // Ajuste si l'interface a bougé

// 👇 On importe le NOUVEAU service unifié
import { DocumentService } from '../../../core/services//Document.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class DocumentsComponent implements OnInit {
  
  // 👇 Injection du DocumentService à la place de StudentService
  private documentService = inject(DocumentService);

  // --- Signaux d'état ---
  documents = signal<MedicalDocumentResponse[]>([]);
  loading = signal<boolean>(false);
  uploading = signal<boolean>(false);
  showForm = signal<boolean>(false);
  activeFilter = signal<string>('ALL');

  // --- Formulaire ---
  selectedFile: File | null = null;
  description = '';

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading.set(true);
    // 👇 Appel de la nouvelle méthode getMyDocuments()
    this.documentService.getMyDocuments().subscribe({
      next: (res: any) => {
        // ⚠️ Si ton backend renvoie une List directe, utilise "res".
        // S'il renvoie un objet avec "data", utilise "res.data".
        this.documents.set(res.data || res); 
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

    this.documentService.uploadDocument(this.selectedFile, this.description).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.showForm.set(false);
        this.selectedFile = null;
        this.description = '';
        this.loadDocuments(); // On recharge la liste après un upload réussi
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

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '—'; 
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  downloadDocument(id: number, fileName: string) {
    this.loading.set(true);
    
    // 👇 Appel de la méthode unifiée de téléchargement
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        this.loading.set(false);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName; // Le nom avec lequel le fichier sera téléchargé
        document.body.appendChild(a);
        a.click();
        
        // Nettoyage de la mémoire
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Erreur téléchargement', err);
        alert('Impossible de télécharger le fichier. Vérifiez s\'il existe toujours sur le serveur.');
      }
    });
  }
}