import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, JournalEntry } from '../../../core/services/student';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal.html',
  styleUrl: './journal.css'
})
export class JournalComponent implements OnInit {
  private svc = inject(StudentService);

  entries = signal<JournalEntry[]>([]);
  loading = signal(true);
  submitting = signal(false);
  showForm = signal(false);
  editingEntry = signal<JournalEntry | null>(null);

  // Formulaire
  title = '';
  content = '';
  mood = '';

  moods = [
    { value: 'HAPPY', label: '😄 Heureux' },
    { value: 'SAD', label: '😢 Triste' },
    { value: 'ANXIOUS', label: '😰 Anxieux' },
    { value: 'CALM', label: '😌 Calme' },
    { value: 'ANGRY', label: '😠 En colère' },
    { value: 'NEUTRAL', label: '😐 Neutre' },
  ];

  ngOnInit() {
    this.loadEntries();
  }

  loadEntries() {
    this.loading.set(true);
    this.svc.getJournalEntries().subscribe({
      next: res => {
        this.entries.set(res.data.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openForm() {
    this.editingEntry.set(null);
    this.title = '';
    this.content = '';
    this.mood = '';
    this.showForm.set(true);
  }

  openEdit(entry: JournalEntry) {
    this.editingEntry.set(entry);
    this.title = entry.title;
    this.content = entry.content;
    this.mood = entry.mood;
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingEntry.set(null);
    this.title = '';
    this.content = '';
    this.mood = '';
  }

  submitEntry() {
    if (!this.title.trim() || !this.content.trim()) return;
    this.submitting.set(true);

    const data = { title: this.title, content: this.content, mood: this.mood };
    const editing = this.editingEntry();

    const request = editing
      ? this.svc.updateJournalEntry(editing.id, data)
      : this.svc.createJournalEntry(data);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeForm();
        this.loadEntries();
      },
      error: () => this.submitting.set(false)
    });
  }

  deleteEntry(id: number) {
    this.svc.deleteJournalEntry(id).subscribe({
      next: () => this.loadEntries()
    });
  }

  getMoodLabel(value: string): string {
    return this.moods.find(m => m.value === value)?.label ?? value;
  }

  truncate(text: string, max = 100): string {
    return text.length > max ? text.substring(0, max) + '...' : text;
  }
}