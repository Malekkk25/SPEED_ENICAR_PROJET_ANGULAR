import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScolarityService } from '../services/scolarity.service';
import { AnalysisResult } from '../models/scolarity.models';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height:100vh;background:#f0f2f5;font-family:Segoe UI,sans-serif">

      <header style="background:#1a237e;color:white;padding:16px 32px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:16px">
          <button (click)="goBack()" style="background:transparent;border:1px solid rgba(255,255,255,0.5);color:white;padding:6px 16px;border-radius:6px;cursor:pointer">← Retour</button>
          <h1 style="margin:0;font-size:20px">Analyse IA — Etudiants a risque</h1>
        </div>
      </header>

      <div style="padding:32px;max-width:1200px;margin:0 auto">

        @if (loading()) {
          <div style="text-align:center;padding:60px;color:#546e7a">
            <div style="font-size:18px">Analyse en cours...</div>
          </div>
        }

        @if (!loading() && results().length === 0) {
          <div style="background:white;border-radius:12px;padding:60px;text-align:center;color:#546e7a">
            <div style="font-size:48px;margin-bottom:16px">✅</div>
            <div style="font-size:18px;font-weight:600">Aucun etudiant a risque detecte</div>
            <div style="font-size:14px;margin-top:8px">Tous les etudiants sont dans les normes</div>
          </div>
        }

        @for (result of results(); track result.studentId) {
          <div style="background:white;border-radius:12px;padding:24px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-left:6px solid"
               [style.border-left-color]="getBorderColor(result.riskLevel)">

            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
              <div>
                <div style="font-size:18px;font-weight:700;color:#1a237e">{{ result.studentName }}</div>
                <div style="font-size:13px;color:#546e7a">{{ result.studentEmail }}</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:32px;font-weight:700" [style.color]="getBorderColor(result.riskLevel)">
                  {{ result.riskScore }}
                </div>
                <div style="font-size:12px;color:#546e7a">Score de risque</div>
                <div style="padding:4px 12px;border-radius:20px;color:white;font-size:12px;font-weight:600;margin-top:4px"
                     [style.background]="getBorderColor(result.riskLevel)">
                  {{ result.riskLevel }}
                </div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px">
              <div style="background:#f5f7fa;border-radius:8px;padding:12px;text-align:center">
                <div style="font-size:22px;font-weight:700;color:#1a237e">{{ result.averageGradePercent }}%</div>
                <div style="font-size:12px;color:#546e7a">Moyenne</div>
              </div>
              <div style="background:#f5f7fa;border-radius:8px;padding:12px;text-align:center">
                <div style="font-size:22px;font-weight:700;color:#e65100">{{ result.unjustifiedAbsences }}</div>
                <div style="font-size:12px;color:#546e7a">Absences injustifiees</div>
              </div>
              <div style="background:#f5f7fa;border-radius:8px;padding:12px;text-align:center">
                <div style="font-size:22px;font-weight:700;color:#b71c1c">{{ result.totalAbsenceDays }}</div>
                <div style="font-size:12px;color:#546e7a">Jours d'absence</div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div>
                <div style="font-size:13px;font-weight:700;color:#1a237e;margin-bottom:8px">Alertes detectees</div>
                @for (alert of result.alerts; track alert) {
                  <div style="font-size:12px;color:#b71c1c;padding:4px 0;border-bottom:1px solid #f5f7fa">
                    {{ alert }}
                  </div>
                }
              </div>
              <div>
                <div style="font-size:13px;font-weight:700;color:#1a237e;margin-bottom:8px">Recommandations</div>
                @for (rec of result.recommendations; track rec) {
                  <div style="font-size:12px;color:#2e7d32;padding:4px 0;border-bottom:1px solid #f5f7fa">
                    → {{ rec }}
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AnalysisComponent implements OnInit {
  private service = inject(ScolarityService);
  private router = inject(Router);

  results = signal<AnalysisResult[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.service.getAtRiskStudents().subscribe({
      next: (data) => {
        this.results.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getBorderColor(level: string): string {
    switch(level) {
      case 'CRITICAL': return '#b71c1c';
      case 'HIGH':     return '#e65100';
      case 'MODERATE': return '#f57f17';
      default:         return '#2e7d32';
    }
  }

  goBack() {
    this.router.navigate(['/scolarity/dashboard']);
  }
}