import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScolarityService } from '../services/scolarity.service';
import { AnalysisResult } from '../models/scolarity.models';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analysis.html',
  styleUrl: './analysis.css'
})
export class AnalysisComponent implements OnInit {
  private service = inject(ScolarityService);
  private router = inject(Router);

  results = signal<AnalysisResult[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.service.getAtRiskStudents().subscribe({
      next: (data) => { this.results.set(data); this.loading.set(false); },
      error: () => { this.error.set('Erreur chargement analyse.'); this.loading.set(false); }
    });
  }

  riskColor(level: string): string {
    switch (level) {
      case 'CRITICAL': return 'risk-critical';
      case 'HIGH':     return 'risk-high';
      case 'MODERATE': return 'risk-moderate';
      default:         return 'risk-low';
    }
  }

  riskLabel(level: string): string {
    switch (level) {
      case 'CRITICAL': return 'CRITIQUE';
      case 'HIGH':     return 'ÉLEVÉ';
      case 'MODERATE': return 'MODÉRÉ';
      default:         return 'FAIBLE';
    }
  }

  borderColor(level: string): string {
    switch (level) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH':     return '#ea580c';
      case 'MODERATE': return '#ca8a04';
      default:         return '#16a34a';
    }
  }

  goBack() { this.router.navigate(['/scolarity/dashboard']); }
}