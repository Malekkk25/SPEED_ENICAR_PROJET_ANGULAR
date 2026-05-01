import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, Appointment, AvailableSlot, AppointmentRequest } from '../../../core/services/student';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class AppointmentsComponent implements OnInit {
  private studentSvc = inject(StudentService);

  appointments = signal<Appointment[]>([]);
  availableSlots = signal<AvailableSlot[]>([]); // Pour la liste déroulante
  
  loading = signal(true);
  submitting = signal(false);
  showForm = signal(false);
  activeFilter = signal<string>('ALL');
  
locationTypes = [
  { value: 'PRESENTIAL', label: '📍 En présentiel' },
  { value: 'ONLINE', label: '💻 En ligne' }
];
  // Champs du formulaire
// Champs du formulaire
  selectedSlot: AvailableSlot | null = null;
  // Ajoute ces deux lignes pour supprimer les erreurs HTML temporairement 
  // MAIS regarde l'étape 2 pour la vraie solution visuelle
  selectedDate: string = ''; 
  selectedTime: string = '';
  
  reason = '';
  type = 'INITIAL';
 // Dans la classe
locationType = 'PRESENTIAL'; 

// Solution A : Accepter le type undefined
getLocationLabel(type: string | undefined): string {
  if (!type) return 'Non défini'; // Sécurité si la donnée est absente
  if (type === 'ONLINE') return '💻 En ligne';
  if (type === 'PRESENTIAL') return '📍 Présentiel';
  return type;
}

types = [
  { value: 'INITIAL', label: 'Consultation initiale' },
  { value: 'FOLLOW_UP', label: 'Suivi' },
  { value: 'URGENT', label: 'Urgent' },
];

  ngOnInit() {
    this.loadAppointments();
    this.loadAvailableSlots();
  }
loadAppointments() {
  this.loading.set(true);
  this.studentSvc.getMyAppointments().subscribe({
    next: (res: any) => {
      // 1. On gère l'extraction selon la structure de ton ApiResponse
      let data = res.data ? res.data : res;

      // 2. CRUCIAL : Si c'est une Page Spring Data, les données sont dans .content
      if (data && data.content) {
        this.appointments.set(data.content);
      } else if (Array.isArray(data)) {
        this.appointments.set(data);
      } else {
        this.appointments.set([]);
      }
      
      this.loading.set(false);
    },
    error: (err) => {
      console.error('Erreur chargement rendez-vous', err);
      this.loading.set(false);
    }
  });
}
loadAvailableSlots() {
  this.studentSvc.getAvailableSlots().subscribe({
    next: (res: any) => {
      const data = res.data ? res.data : res;
      console.log('Créneaux chargés :', data); // Pour vérifier dans la console F12
      this.availableSlots.set(data);
    },
    error: (err) => console.error('Erreur chargement créneaux', err)
  });
}

  filteredAppointments() {
    if (this.activeFilter() === 'ALL') return this.appointments();
    return this.appointments().filter(a => a.status === this.activeFilter());
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

 submitAppointment() { // Attention au nom de la méthode (double 's')
  if (!this.selectedSlot) return;

  this.submitting.set(true);

  const appointmentRequest: AppointmentRequest = {
    psychologistId: this.selectedSlot.psychologistId,
    // S'assurer que le format correspond à ce que le Backend attend (ISO string)
    // Si selectedSlot.dateTime est déjà une string ISO venant du back, on l'utilise direct
    dateTime: this.selectedSlot.dateTime, 
    reason: this.reason,
    type: this.type,
    locationType: this.locationType
  };

  // Correction du nom du service injecté : studentSvc
  this.studentSvc.requestAppointment(appointmentRequest).subscribe({
    next: () => {
      alert("Rendez-vous réservé avec succès !");
      this.showForm.set(false);
      this.loadAppointments(); // Recharger la liste
      this.loadAvailableSlots(); // Rafraîchir les créneaux (celui-ci va disparaître)
      this.resetForm();
    },
    error: (err) => {
      console.error(err);
      alert("Erreur lors de la réservation.");
    },
    complete: () => this.submitting.set(false)
  });
}
resetForm() {
  this.selectedSlot = null; // 👈 C'est ici qu'il faut corriger !
  this.reason = '';
  this.type = 'INITIAL';
  this.locationType = 'PRESENTIAL';
}

  // Fonctions d'affichage (Badges)
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return classes[status] ?? 'status-pending';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmé',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] ?? status;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'INITIAL': 'Initiale',
      'FOLLOW_UP': 'Suivi',
      'URGENT': 'Urgent'
    };
    return labels[type] ?? type;
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'INITIAL': 'type-initial',
      'FOLLOW_UP': 'type-follow_up',
      'URGENT': 'type-urgent'
    };
    return classes[type] ?? '';
  }
  // Transforme la liste plate en groupes par date pour le template
// Dans AppointmentsComponent
getSlotsByDate() {
  const groups: Record<string, AvailableSlot[]> = {};
  
  this.availableSlots().forEach(slot => {
    // On utilise dayOfWeek comme clé de groupe puisque c'est ce que ton API renvoie
    const key = slot.dayOfWeek; 
    if (!groups[key]) groups[key] = [];
    groups[key].push(slot);
  });

  return Object.keys(groups).map(date => ({ date, slots: groups[date] }));
}

}