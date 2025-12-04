import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, LearningPath } from '../../services/api.service';

@Component({
  selector: 'app-roadmaps-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="header">
        <h1>Roadmaps de la Comunidad</h1>
        <p class="muted">Lista de roadmaps públicos creados por usuarios</p>
        <div class="actions">
          <a class="btn ghost" routerLink="/roadmaps/oficiales">Ver roadmaps oficiales</a>
          <a class="btn primary" routerLink="/roadmaps/editor">Crear tu roadmap</a>
        </div>
      </header>

      <div class="toolbar">
        <input class="search" type="text" [(ngModel)]="query" (ngModelChange)="applyFilter()" placeholder="Buscar por título..." />
        <select class="sort" [(ngModel)]="sort" (ngModelChange)="applyFilter()">
          <option value="newest">Más nuevos</option>
          <option value="oldest">Más antiguos</option>
          <option value="title">Título</option>
        </select>
      </div>

      <div class="grid">
        <article class="card glass" *ngFor="let lp of filtered()">
          <div class="row">
            <h3 class="title">{{ lp.title }}</h3>
            <span class="badge" *ngIf="lp.visibility==='public'">Público</span>
          </div>
          <p class="desc" *ngIf="lp.description">{{ lp.description }}</p>
          <div class="row gap">
            <a class="btn" [routerLink]="['/roadmaps/comunidad', lp.id]" target="_blank">Abrir</a>
          </div>
        </article>
        <p *ngIf="filtered().length===0" class="muted">Sin resultados.</p>
      </div>
    </section>
  `,
  styles: [`
    .page { padding: 24px; max-width: 980px; margin: 0 auto; }
    .header { display:grid; gap:6px; }
    .muted { color: var(--color-muted); }
    .actions { display:flex; gap:8px; }
    .toolbar { display:flex; gap:10px; align-items:center; margin: 12px 0; }
    .search { flex:1; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; }
    .sort { padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { padding: 16px; border-radius: 14px; }
    .row { display:flex; align-items:center; gap:10px; justify-content:space-between; }
    .gap { gap: 8px; }
    .title { margin: 0; font-size: 1rem; }
    .desc { margin: 6px 0 10px; }
    .badge { padding:4px 8px; border-radius:999px; background:#22c55e; color:#0b1220; font-weight:700; font-size:.75rem; }
    .btn { appearance:none; border:none; border-radius: 10px; font-weight:600; cursor:pointer; padding:8px 10px; background: rgba(255,255,255,.10); color: inherit; }
    .btn.primary { background: linear-gradient(90deg,#6d28d9,#5b21b6); color:#fff; border:1px solid rgba(255,255,255,.18); }
    .btn.ghost { background: transparent; border:1px solid rgba(255,255,255,.18); }
  `]
})
export class RoadmapsCommunityPage implements OnInit {
  list = signal<LearningPath[]>([]);
  filtered = signal<LearningPath[]>([]);
  query = '';
  sort: 'newest'|'oldest'|'title' = 'newest';
  constructor(private api: ApiService) {}
  async ngOnInit() {
    try {
      const items = await this.api.listPublicLearningPaths();
      this.list.set(items || []);
      this.applyFilter();
    } catch (e) { this.list.set([]); this.filtered.set([]); }
  }
  applyFilter() {
    const q = this.query.trim().toLowerCase();
    let arr = this.list();
    if (q) arr = arr.filter(x => (x.title || '').toLowerCase().includes(q));
    switch (this.sort) {
      case 'title': arr = arr.slice().sort((a,b) => (a.title||'').localeCompare(b.title||'')); break;
      case 'oldest': arr = arr.slice().sort((a,b) => (a.createdAt||'').localeCompare(b.createdAt||'')); break;
      default: arr = arr.slice().sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''));
    }
    this.filtered.set(arr);
  }
}
