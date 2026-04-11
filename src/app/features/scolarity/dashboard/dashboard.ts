import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ScolarityService } from '../services/scolarity.service';

@Component({
  selector: 'app-scolarity-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height:100vh;background:#f0f2f5;font-family:Segoe UI,sans-serif">
      <header style="background:#1a237e;color:white;padding:16px 32px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:16px">
          <div style="width:48px;height:48px;background:white;color:#1a237e;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px">S</div>
          <div>
            <h1 style="margin:0;font-size:20px">SPEED - Espace Scolarite</h1>
            <p style="margin:0;font-size:13px;opacity:0.8">Bonjour, {{ user()?.firstName }} {{ user()?.lastName }}</p>
          </div>
        </div>
        <button (click)="logout()" style="background:transparent;border:1px solid rgba(255,255,255,0.6);color:white;padding:8px 20px;border-radius:6px;cursor:pointer">Deconnexion</button>
      </header>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:40px 32px;max-width:1200px;margin:0 auto">
        <div (click)="goTo('students')" style="background:white;border-radius:12px;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-top:4px solid #1565c0">
          <div style="font-size:48px;font-weight:700;color:#1a237e">{{ totalStudents() }}</div>
          <div style="font-size:14px;font-weight:600;color:#546e7a">Dossiers etudiants</div>
        </div>
        <div (click)="goTo('documents')" style="background:white;border-radius:12px;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-top:4px solid #e65100">
          <div style="font-size:48px;font-weight:700;color:#1a237e">{{ pendingDocuments() }}</div>
          <div style="font-size:14px;font-weight:600;color:#546e7a">Documents en attente</div>
        </div>
        <div (click)="goTo('absences')" style="background:white;border-radius:12px;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-top:4px solid #b71c1c">
          <div style="font-size:48px;font-weight:700;color:#1a237e">{{ prolongedAbsences() }}</div>
          <div style="font-size:14px;font-weight:600;color:#546e7a">Absences prolongees</div>
        </div>
        <div (click)="goTo('analysis')" style="background:white;border-radius:12px;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-top:4px solid #6a1b9a">
          <div style="font-size:48px;font-weight:700;color:#1a237e">{{ atRiskStudents() }}</div>
          <div style="font-size:14px;font-weight:600;color:#546e7a">Etudiants a risque (IA)</div>
        </div>
      </div>
    </div>
  `
})
export class ScolarityDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private scolarityService = inject(ScolarityService);

  user = this.auth.currentUser;
  totalStudents = signal<number>(0);
  pendingDocuments = signal<number>(0);
  prolongedAbsences = signal<number>(0);
  atRiskStudents = signal<number>(0);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);

    this.scolarityService.getStudents(0, 1).subscribe({
      next: (page) => this.totalStudents.set(page.totalElements),
      error: () => this.totalStudents.set(0)
    });

    this.scolarityService.getPendingDocuments().subscribe({
      next: (docs) => this.pendingDocuments.set(docs.length),
      error: () => this.pendingDocuments.set(0)
    });

    this.scolarityService.getProlongedAbsences().subscribe({
      next: (abs) => this.prolongedAbsences.set(abs.length),
      error: () => this.prolongedAbsences.set(0)
    });

    this.scolarityService.getAtRiskStudents().subscribe({
      next: (results) => {
        this.atRiskStudents.set(results.length);
        this.loading.set(false);
      },
      error: () => {
        this.atRiskStudents.set(0);
        this.loading.set(false);
      }
    });
  }

  goTo(path: string) {
    this.router.navigate(['/scolarity/' + path]);
  }

  logout() {
    this.auth.logout();
  }
}