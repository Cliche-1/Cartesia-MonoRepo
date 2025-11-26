import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, LearningPath, SearchRoadmapsResponse } from '../../services/api.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="header">
        <h1>Buscar roadmaps</h1>
        <p class="muted">Búsqueda avanzada con filtros</p>
      </header>

      <ng-container>
        <div class="search-bar">
          <input type="text" [(ngModel)]="q" (keyup.enter)="applySearch()" (input)="onSuggest()" placeholder="Busca por temática o palabras clave" />
          <div class="suggestions" *ngIf="suggestOpen && (suggestLP.length || suggestPS.length)">
            <div class="suggest-group" *ngIf="suggestLP.length">
              <div class="group-title">Roadmaps</div>
              <button class="suggest" *ngFor="let s of suggestLP" (click)="useSuggestion(s.title)">{{s.title}}</button>
            </div>
            <div class="suggest-group" *ngIf="suggestPS.length">
              <div class="group-title">Pasos</div>
              <button class="suggest" *ngFor="let s of suggestPS" (click)="useSuggestion(s.title)">{{s.title}}</button>
            </div>
          </div>
        </div>

        <div class="filters">
          <button class="chip" (click)="filtersOpen=true"><i class="pi pi-sliders-h"></i><span>Filtrar y ordenar</span></button>
          <div class="chip-group">
            <label class="chip"><input type="checkbox" [(ngModel)]="hasResources" (change)="applySearch()" /> Con recursos</label>
            <label class="chip">Tipo
              <select [(ngModel)]="resourceType" (change)="applySearch()">
                <option value="">Todos</option>
                <option value="Artículo">Artículo</option>
                <option value="Video">Video</option>
                <option value="Curso">Curso</option>
                <option value="Documentación">Documentación</option>
                <option value="Herramienta">Herramienta</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
            <label class="chip">Pasos
              <input type="number" min="1" [(ngModel)]="minSteps" (change)="applySearch()" placeholder="mín" />
              <span>-</span>
              <input type="number" min="1" [(ngModel)]="maxSteps" (change)="applySearch()" placeholder="máx" />
            </label>
            <label class="chip">Orden
              <select [(ngModel)]="sortBy" (change)="applySearch()">
                <option value="created_at">Fecha</option>
                <option value="title">Título</option>
                <option value="steps_count"># de pasos</option>
              </select>
              <select [(ngModel)]="sortDir" (change)="applySearch()">
                <option value="DESC">Desc</option>
                <option value="ASC">Asc</option>
              </select>
            </label>
          </div>
        </div>

        <div class="drawer" [class.open]="filtersOpen" (click)="filtersOpen=false">
          <div class="panel" (click)="$event.stopPropagation()">
            <header class="panel-header">
              <h3>Filtrar y ordenar</h3>
              <button class="close" (click)="filtersOpen=false"><i class="pi pi-times"></i></button>
            </header>
            <div class="panel-section">
              <div class="section-title">Ordenar por</div>
              <label class="radio"><input type="radio" name="sortBy" [(ngModel)]="sortBy" value="title" (change)="applySearch()" /> Mejor coincidencia (título)</label>
              <label class="radio"><input type="radio" name="sortBy" [(ngModel)]="sortBy" value="created_at" (change)="applySearch()" /> El más nuevo</label>
              <label class="radio"><input type="radio" name="sortBy" [(ngModel)]="sortBy" value="steps_count" (change)="applySearch()" /> # de pasos</label>
            </div>
            <div class="panel-section">
              <div class="section-title">Tipo de recurso</div>
              <select [(ngModel)]="resourceType" (change)="applySearch()">
                <option value="">Todos</option>
                <option value="Artículo">Artículo</option>
                <option value="Video">Video</option>
                <option value="Curso">Curso</option>
                <option value="Documentación">Documentación</option>
                <option value="Herramienta">Herramienta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div class="panel-section">
              <div class="section-title">Rango de pasos</div>
              <div class="range">
                <input type="number" min="1" [(ngModel)]="minSteps" placeholder="mín" />
                <span>-</span>
                <input type="number" min="1" [(ngModel)]="maxSteps" placeholder="máx" />
                <button class="btn" (click)="applySearch()">Aplicar</button>
              </div>
            </div>
          </div>
        </div>

        <div class="results">
          <article class="card course" *ngFor="let lp of items">
            <div class="thumb">
              <div class="badge">{{ lp.provider || 'Cartesia' }}</div>
              <img *ngIf="lp.thumbnail" [src]="lp.thumbnail" alt="thumbnail" />
              <i *ngIf="!lp.thumbnail" class="pi pi-map"></i>
            </div>
            <div class="body">
              <h3 class="title">{{ lp.title }}</h3>
              <p class="skills" *ngIf="lp.description"><span>Descripción:</span> {{ lp.description }}</p>
              <div class="meta">
                <span><i class="pi pi-star"></i> Pasos {{ lp.stepsCount || 0 }}</span>
                <span>Recursos {{ lp.resourcesCount || 0 }}</span>
              </div>
              <div class="actions">
                <button class="btn accent" (click)="onFollow(lp)" [disabled]="!api.authState() || followingIds.has(lp.id)">{{ followingIds.has(lp.id) ? 'Siguiendo' : 'Seguir' }}</button>
                <a class="btn" [routerLink]="['/roadmaps/preview']" [queryParams]="{ lp: lp.id }">Ver</a>
                <a class="btn ghost" [routerLink]="['/roadmaps/editor']" [queryParams]="{ lp: lp.id }">Editar</a>
              </div>
            </div>
          </article>
          <p *ngIf="items.length===0" class="muted">Sin resultados</p>
        </div>

        <div class="pagination" *ngIf="total > pageSize">
          <button class="btn" (click)="prevPage()" [disabled]="page<=1">Prev</button>
          <span>Página {{page}} de {{ totalPages }}</span>
          <button class="btn" (click)="nextPage()" [disabled]="page>=totalPages">Next</button>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`
    .page { padding: 24px; max-width: 980px; margin: 0 auto; }
    .muted { color: var(--color-muted); }
    .search-bar { position: relative; }
    .suggestions { position:absolute; left:0; right:0; top:36px; background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:6px; box-shadow:0 8px 20px rgba(16,10,43,.12); z-index:10; }
    .suggest-group { padding:6px; }
    .group-title { font-size:.8rem; color:#64748b; margin-bottom:6px; }
    .suggest { display:block; width:100%; text-align:left; padding:8px 10px; border-radius:8px; border:0; background:transparent; cursor:pointer; }
    .suggest:hover { background:#f1f5f9; }
    .filters { display:grid; gap:10px; margin: 14px 0; }
    .chip-group { display:flex; flex-wrap:wrap; gap:8px; }
    .chip { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; border:1px solid rgba(17,24,39,.12); background: rgba(255,255,255,.06); color: var(--color-text); }
    .chip select, .chip input[type=number] { border:0; background:transparent; }
    .results { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { padding: 16px; border-radius: 14px; border:1px solid rgba(0,0,0,.06); background:#fff; }
    .card.course { padding:0; overflow:hidden; }
    .card.course .thumb { position:relative; height:160px; background: linear-gradient(135deg,#7c3aed,#5b21b6); display:flex; align-items:center; justify-content:center; color:#fff; overflow:hidden; }
    .card.course .thumb img { width:100%; height:100%; object-fit:cover; display:block; }
    .card.course .thumb .badge { position:absolute; left:10px; top:10px; background:#fff; color:#111827; border-radius:8px; font-size:.75rem; padding:4px 8px; border:1px solid rgba(0,0,0,.08); }
    .card.course .thumb i { font-size: 1.6rem; opacity:.9; }
    .card.course .body { padding: 12px 14px; display:grid; gap:8px; }
    .card.course .skills { color:#374151; font-size:.9rem; }
    .card.course .skills span { color:#64748b; font-weight:600; }
    .card.course .meta { display:flex; gap:12px; align-items:center; color:#6b7280; font-size:.85rem; }
    .card.course .actions { display:flex; gap:8px; }
    .row { display:flex; align-items:center; gap:10px; }
    .gap { gap: 8px; }
    .title { margin: 0; font-size: 1rem; }
    .desc { margin: 6px 0 10px; }
    .center { text-align: center; }
    .cta { display:flex; gap: 12px; justify-content:center; margin-top: 8px; }
    .pagination { display:flex; align-items:center; gap:10px; margin-top: 12px; }
    input[type=text] { width: 100%; padding: 10px 12px; border:1px solid #e5e7eb; border-radius: 10px; }
    select { padding: 8px; border-radius: 10px; }
    .btn { appearance:none; border:none; border-radius: 10px; font-weight:600; cursor:pointer; padding:8px 10px; background: rgba(17,24,39,.06); color: #111827; }
    .btn.ghost { background: transparent; border:1px solid rgba(17,24,39,.12); }
    .btn.accent { background: linear-gradient(90deg,#6d28d9,#5b21b6); color:#fff; border:1px solid rgba(255,255,255,.18); }
    .drawer { position:fixed; inset:0; background:rgba(0,0,0,.35); opacity:0; pointer-events:none; transition: .2s; }
    .drawer.open { opacity:1; pointer-events:auto; }
    .panel { position:absolute; right:0; top:0; bottom:0; width: 340px; background:#fff; box-shadow:-6px 0 20px rgba(0,0,0,.16); padding:12px; display:grid; gap:14px; }
    .panel-header { display:flex; align-items:center; justify-content:space-between; }
    .panel-section { display:grid; gap:8px; border-top:1px solid #e5e7eb; padding-top:8px; }
    .section-title { font-size:.85rem; color:#64748b; }
    .radio { display:flex; align-items:center; gap:8px; }
    .range { display:flex; align-items:center; gap:8px; }
  `]
})
export class SearchPage implements OnInit {
  q = '';
  hasResources = false;
  resourceType: string = '';
  minSteps?: number;
  maxSteps?: number;
  sortBy: 'created_at'|'title'|'steps_count' = 'created_at';
  sortDir: 'ASC'|'DESC' = 'DESC';
  page = 1;
  pageSize = 12;
  total = 0;
  items: LearningPath[] = [];
  followingIds = new Set<number>();
  totalPages = 1;
  suggestLP: {id:number; title:string}[] = [];
  suggestPS: {id:number; title:string; learningPathId:number}[] = [];
  suggestOpen = false;
  filtersOpen = false;

  constructor(public api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(async qp => {
      this.q = qp.get('q') || '';
      const pageStr = qp.get('page');
      this.page = pageStr ? parseInt(pageStr, 10) || 1 : 1;
      await this.applySearch();
    });
  }

  async applySearch() {
    const res: SearchRoadmapsResponse = await this.api.searchRoadmaps({ q: this.q, hasResources: this.hasResources, resourceType: this.resourceType || undefined, minSteps: this.minSteps, maxSteps: this.maxSteps, sortBy: this.sortBy, sortDir: this.sortDir, page: this.page, pageSize: this.pageSize });
    this.items = res.items || [];
    this.total = res.total || 0;
    this.page = res.page || 1;
    this.pageSize = res.pageSize || this.pageSize;
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.suggestOpen = false;
  }

  async onSuggest() {
    const q = this.q.trim();
    if (!q) { this.suggestLP = []; this.suggestPS = []; this.suggestOpen = false; return; }
    try {
      const s = await this.api.searchSuggestions(q);
      this.suggestLP = s.learningPaths || [];
      this.suggestPS = s.pathSteps || [];
      this.suggestOpen = true;
    } catch {
      this.suggestOpen = false;
    }
  }

  useSuggestion(text: string) {
    this.q = text;
    this.applySearch();
  }

  prevPage() { if (this.page>1) { this.page--; this.updateQuery(); } }
  nextPage() { if (this.page<this.totalPages) { this.page++; this.updateQuery(); } }
  updateQuery() { this.router.navigate([], { queryParams: { q: this.q, page: this.page }, queryParamsHandling: 'merge' }); }

  onFollow(lp: LearningPath) {
    if (!lp?.id) return;
    if (!this.api.isAuthenticated()) { alert('Inicia sesión para seguir roadmaps'); return; }
    this.followingIds.add(lp.id);
    alert('Ahora sigues este roadmap');
  }
}
