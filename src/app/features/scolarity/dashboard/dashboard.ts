import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ScolarityService } from '../services/scolarity.service';

@Component({
  selector: 'app-scolarity-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
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