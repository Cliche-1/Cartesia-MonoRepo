import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService, LearningPath } from '../../services/api.service';

@Component({
  selector: 'app-my-roadmaps',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <header class="header">
        <h1>Mis roadmaps</h1>
        <p class="muted">Roadmaps que has creado</p>
        <div class="actions">
          <button class="btn primary" (click)="createNew()">Nuevo roadmap</button>
        </div>
      </header>

      <ng-container *ngIf="api.isAuthenticated(); else authPrompt">
        <div class="grid">
          <article class="card glass" *ngFor="let lp of items()">
            <div class="row">
              <i class="pi pi-map"></i>
              <h3 class="title">{{ lp.title }}</h3>
            </div>
            <p class="desc" *ngIf="lp.description">{{ lp.description }}</p>
            <div class="row gap">
              <a class="btn ghost" [routerLink]="['/roadmaps/editor']" [queryParams]="{ lp: lp.id }">Editar</a>
              <a class="btn" [routerLink]="['/roadmaps/preview']" [queryParams]="{ lp: lp.id }">Preview</a>
            </div>
          </article>
          <p *ngIf="items().length===0" class="muted">Aún no has creado roadmaps.</p>
        </div>
      </ng-container>

      <ng-template #authPrompt>
        <div class="card glass center">
          <p>Inicia sesión para ver tus roadmaps.</p>
          <div class="cta">
            <a class="btn primary" routerLink="/login">Iniciar sesión</a>
            <a class="btn ghost" routerLink="/register">Crear cuenta</a>
          </div>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .page { padding: 24px; max-width: 980px; margin: 0 auto; }
    .muted { color: var(--color-muted); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { padding: 16px; border-radius: 14px; }
    .row { display:flex; align-items:center; gap:10px; }
    .gap { gap: 8px; }
    .title { margin: 0; font-size: 1rem; }
    .desc { margin: 6px 0 10px; }
    .center { text-align: center; }
    .cta { display:flex; gap: 12px; justify-content:center; margin-top: 8px; }
  `]
})
export class MyRoadmapsPage implements OnInit {
  items = signal<LearningPath[]>([]);
  constructor(public api: ApiService, private router: Router) {}

  async ngOnInit() {
    if (!this.api.isAuthenticated()) return;
    try {
      const list = await this.api.listMyLearningPaths();
      this.items.set(list || []);
    } catch (e) {
      console.error('Error cargando mis roadmaps', e);
      this.items.set([]);
    }
  }

  async createNew() {
    if (!this.api.isAuthenticated()) { this.router.navigateByUrl('/login'); return; }
    try {
      const lp = await this.api.createLearningPath({ title: 'Roadmap', description: '', visibility: 'private' });
      const url = this.router.createUrlTree(['/roadmaps/editor'], { queryParams: { lp: lp?.id } }).toString();
      this.router.navigateByUrl(url);
    } catch (e) {
      console.error('No se pudo crear el roadmap', e);
    }
  }
}
