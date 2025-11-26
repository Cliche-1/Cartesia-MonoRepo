import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Graph, Node } from '@antv/x6';
import { ActivatedRoute } from '@angular/router';
import { ApiService, LearningPath } from '../../services/api.service';
// Backend controls removidos: preview solo usa datos locales

@Component({
  selector: 'app-roadmap-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="viewer">
      <div class="hero">
        <div class="hero-content">
          <div class="brand" *ngIf="summary.provider"><span class="badge">{{summary.provider}}</span></div>
          <h2 class="title">{{ summary.title || 'Roadmap' }}</h2>
          <p class="subtitle" *ngIf="summary.description">{{ summary.description }}</p>
          <div class="rating" *ngIf="lpId">
            <div class="stars">
              <button type="button" class="star" [class.active]="myRating>=1" (click)="onRate(1)"><i class="pi pi-star-fill"></i></button>
              <button type="button" class="star" [class.active]="myRating>=2" (click)="onRate(2)"><i class="pi pi-star-fill"></i></button>
              <button type="button" class="star" [class.active]="myRating>=3" (click)="onRate(3)"><i class="pi pi-star-fill"></i></button>
              <button type="button" class="star" [class.active]="myRating>=4" (click)="onRate(4)"><i class="pi pi-star-fill"></i></button>
              <button type="button" class="star" [class.active]="myRating>=5" (click)="onRate(5)"><i class="pi pi-star-fill"></i></button>
            </div>
            <div class="rating-meta" *ngIf="ratingAvg">Promedio: {{ratingAvg | number:'1.1-1'}}/5</div>
          </div>
          <div class="actions">
            <button class="btn primary">Empezar</button>
            <button class="btn ghost">Guardar</button>
            <button class="btn" (click)="openExport()" *ngIf="lpId">Exportar</button>
          </div>
          <div class="facts">
            <div class="fact">
              <div class="fact-title">Pasos</div>
              <div class="fact-value">{{summary.stepsCount || 0}}</div>
            </div>
            <div class="fact">
              <div class="fact-title">Recursos</div>
              <div class="fact-value">{{summary.resourcesCount || 0}}</div>
            </div>
            <div class="fact" *ngIf="summary.createdAt">
              <div class="fact-title">Creado</div>
              <div class="fact-value">{{summary.createdAt | date:'mediumDate'}}</div>
            </div>
          </div>
        </div>
        <div class="hero-thumb" *ngIf="summary.thumbnail">
          <img [src]="summary.thumbnail" alt="thumbnail"/>
        </div>
      </div>

      <div class="viewer-wrap">
        <div #graphContainer class="graph" id="graph-preview" (contextmenu)="$event.preventDefault()"></div>
        <aside class="details" *ngIf="sidebarOpen && activeNode">
          <div class="details-header">
            <h3>{{activeNodeLabel || 'Nodo'}}</h3>
            <button type="button" class="close" (click)="closeSidebar()">✕</button>
          </div>
          <div class="details-content">
            <div class="block" *ngIf="contentTitle">
              <div class="muted">Título</div>
              <div class="value">{{contentTitle}}</div>
            </div>
            <div class="block" *ngIf="contentDescription">
              <div class="muted">Descripción</div>
              <div class="value desc">{{contentDescription}}</div>
            </div>
            <div class="block" *ngIf="resources?.length">
              <div class="muted">Recursos</div>
              <ul class="resources">
                <li *ngFor="let r of resources">
                  <span class="badge">{{r.type}}</span>
                  <a [href]="r.url" target="_blank" rel="noopener">{{r.title || r.url}}</a>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <div class="comment-form" *ngIf="api.authState() && lpId">
        <textarea [(ngModel)]="newComment" placeholder="Escribe un comentario" rows="3"></textarea>
        <div class="row">
          <button class="btn primary" (click)="submitRoadmapComment()" [disabled]="submitting || !newComment">Enviar</button>
          <span class="muted" *ngIf="submitting">Enviando…</span>
        </div>
      </div>

      <div class="reviews" *ngIf="comments.length">
        <h3>Opiniones</h3>
        <div class="list">
          <article class="review" *ngFor="let c of comments">
            <div class="avatar">{{ c.username?.charAt(0) || '?' }}</div>
            <div class="content">
              <div class="meta"><span class="name">{{c.username}}</span> • <span class="date">{{c.createdAt | date:'mediumDate'}}</span></div>
              <p>{{c.content}}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
    <div class="export-modal" *ngIf="exportOpen">
      <div class="modal-card">
        <h3>Exportar a PDF</h3>
        <div class="form">
          <label class="field"><span>Versión</span>
            <select [(ngModel)]="exportVersionId">
              <option [ngValue]="null">Actual</option>
              <option *ngFor="let v of versions" [ngValue]="v.id">#{{v.id}} — {{v.createdAt | date:'medium'}}</option>
            </select>
          </label>
          <label class="check"><input type="checkbox" [(ngModel)]="exportIncludeResources"/> <span>Incluir recursos</span></label>
          <label class="check"><input type="checkbox" [(ngModel)]="exportIncludeComments"/> <span>Incluir comentarios</span></label>
          <div class="row">
            <label class="field"><span>Tamaño</span>
              <select [(ngModel)]="exportPageSize">
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </label>
            <label class="field"><span>Orientación</span>
              <select [(ngModel)]="exportOrientation">
                <option value="portrait">Vertical</option>
                <option value="landscape">Horizontal</option>
              </select>
            </label>
          </div>
        </div>
        <div class="row">
          <button class="btn primary" (click)="startExport()">Descargar PDF</button>
          <button class="btn ghost" (click)="exportOpen=false">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .viewer { display:grid; gap:14px; padding:16px; color: var(--color-text); }
    .hero { display:grid; grid-template-columns: 1.4fr .8fr; gap: 16px; align-items:center; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.16); border-radius: 16px; padding: 16px; }
    .hero-thumb img { width:100%; height:180px; object-fit:cover; border-radius:12px; }
    .title { margin:0; font-size:1.6rem; }
    .subtitle { margin:6px 0 12px; color: var(--color-muted); }
    .rating { display:flex; align-items:center; gap:8px; margin:8px 0; }
    .stars { display:flex; gap:4px; }
    .star { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.08); color:#c9b8ff; cursor:pointer; }
    .star.active { background: linear-gradient(90deg,#6d28d9,#5b21b6); color:#fff; border-color: rgba(255,255,255,.28); }
    .rating-meta { color: var(--color-muted); font-size:.85rem; }
    .facts { display:grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; margin-top: 10px; }
    .fact { background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.16); border-radius: 12px; padding: 10px; }
    .fact-title { font-size:.8rem; color:#cbd5e1; }
    .fact-value { font-weight:700; }
    .btn { appearance:none; border:none; border-radius: 10px; font-weight:600; cursor:pointer; padding:8px 10px; background: rgba(255,255,255,.10); color: inherit; }
    .btn.primary { background: linear-gradient(90deg,#6d28d9,#5b21b6); color:#fff; border:1px solid rgba(255,255,255,.18); }
    .viewer-wrap { position:relative; }
    .graph { width:100%; height: calc(100vh - 160px); background: #f7f7fb; border:1px solid rgba(255,255,255,.12); border-radius: 12px; }
    .details { position:absolute; right:12px; top:12px; bottom:12px; width:340px; border:1px solid rgba(255,255,255,.12); border-radius:12px; background: rgba(17,24,39,.6); backdrop-filter: blur(6px) saturate(115%); box-shadow: 0 22px 40px rgba(16,10,43,.35); }
    .details-header { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.12); }
    .details-header h3 { margin:0; font-size:1rem; }
    .details-header .close { width:32px; height:32px; border:0; border-radius:8px; background: rgba(255,255,255,.08); color: inherit; cursor: pointer; }
    .details-content { padding:12px; display:grid; gap:12px; }
    .block { display:grid; gap:6px; }
    .muted { font-size:.82rem; color:#cbd5e1; letter-spacing:.02em; }
    .value { font-weight:600; }
    .value.desc { white-space:pre-line; font-weight:500; color:#e5e7eb; }
    .resources { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
    .resources li { display:flex; align-items:center; gap:8px; }
    .badge { display:inline-block; padding:4px 8px; border-radius:999px; background:#fde047; color:#111827; font-weight:700; font-size:.8rem; }
    .resources a { color:#93c5fd; text-decoration:none; }
    .resources a:hover { text-decoration:underline; }
    .comment-form { display:grid; gap:8px; margin-top: 8px; }
    .comment-form textarea { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; }
    .comment-form .row { display:flex; align-items:center; gap:10px; }
    .reviews { display:grid; gap:12px; }
    .reviews h3 { margin:0; font-size:1.2rem; }
    .list { display:grid; gap:10px; }
    .review { display:grid; grid-template-columns: 40px 1fr; gap:10px; align-items:flex-start; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.16); border-radius: 12px; padding: 10px; }
    .avatar { width:36px; height:36px; border-radius:999px; background:#111827; color:#fff; display:grid; place-items:center; font-weight:700; }
    .review .meta { font-size:.85rem; color:#cbd5e1; }
    .export-modal { position:fixed; inset:0; display:grid; place-items:center; background: rgba(0,0,0,.5); z-index:50; }
    .export-modal .modal-card { width:520px; max-width:90vw; background: var(--color-bg-2,#0f172a); border:1px solid rgba(255,255,255,.16); border-radius:14px; padding:16px; color: var(--color-text); }
    .export-modal h3 { margin:0 0 10px; }
    .export-modal .form { display:grid; gap:10px; }
    .export-modal .field { display:grid; gap:6px; }
    .export-modal select { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; }
    .export-modal .check { display:flex; align-items:center; gap:8px; }
    .export-modal .row { display:flex; align-items:center; gap:10px; margin-top: 10px; }
    @media print { .no-print { display:none !important; } }
  `]
})
export class RoadmapPreviewPage implements OnInit, OnDestroy {
  @ViewChild('graphContainer', { static: true }) graphEl!: ElementRef<HTMLDivElement>;
  private graph!: Graph;
  sidebarOpen = false;
  activeNode?: Node;
  activeNodeLabel = '';
  contentTitle = '';
  contentDescription = '';
  resources: { type: string; title: string; url: string }[] = [];
  summary: LearningPath = { id: 0, title: '' } as any;
  comments: { id:number; content:string; createdAt:string; username:string }[] = [];
  lpId?: number;
  constructor(private route: ActivatedRoute, public api: ApiService) {}

  ngOnInit(): void {
    this.graph = new Graph({
      container: this.graphEl.nativeElement,
      background: { color: '#f7f7fb' },
      grid: { visible: false },
      panning: true,
      mousewheel: { enabled: true, modifiers: 'ctrl' },
      interacting: false,
    });

    const idStr = this.route.snapshot.queryParamMap.get('lp');
    this.lpId = idStr ? parseInt(idStr, 10) : undefined;
    const exp = this.route.snapshot.queryParamMap.get('export');
    if (this.lpId) {
      this.api.getLearningPathSummary(this.lpId).then(s => this.summary = s as any).catch(() => {});
      this.api.getLearningPathDiagram(this.lpId).then(d => this.loadGraphFromJSON(d?.diagramJSON)).catch(() => this.loadGraph());
      this.api.getLearningPathComments(this.lpId).then(r => this.comments = r.items || []).catch(() => {});
      this.loadRatings();
      this.loadVersions();
    } else {
      this.loadGraph();
    }
    if (exp === '1') { this.exportOpen = true; }
    // Asegurar que las aristas se rendericen con conectores suaves
    this.applySmoothConnectors();

    this.graph.on('node:click', ({ node }) => {
      this.openSidebarFromNode(node as Node);
    });
    this.graph.on('node:contextmenu', ({ node, e }) => {
      e.preventDefault();
      e.stopPropagation();
      this.openSidebarFromNode(node as Node);
    });
    this.graph.on('blank:click', () => { this.closeSidebar(); });
  }

  ngOnDestroy(): void { this.graph?.dispose(); }

  private loadGraph() {
    try {
      const str = localStorage.getItem('roadmap-editor-graph');
      if (!str) return;
      const data = JSON.parse(str);
      this.graph?.fromJSON(data);
      // Tras cargar, aplicar conectores suaves
      this.applySmoothConnectors();
    } catch (e) { console.error('Error al cargar previsualización', e); }
  }

  private loadGraphFromJSON(json?: string) {
    if (!json) return;
    try {
      const data = JSON.parse(json);
      this.graph?.fromJSON(data);
      this.applySmoothConnectors();
    } catch {}
  }

  

  // Forzar renderizado curvo de las conexiones en la preview
  private applySmoothConnectors() {
    const edges = this.graph?.getEdges?.() || [];
    edges.forEach((edge) => {
      // Conector curvo
      edge.setConnector('smooth');
      // Estilo coherente con el editor
      edge.attr('line/stroke', '#A2B1C3');
      edge.attr('line/strokeWidth', 2);
      edge.attr('line/targetMarker', '');
    });
  }

  private openSidebarFromNode(node: Node) {
    this.activeNode = node;
    this.activeNodeLabel = String(node.attr('label/text') || node.getData()?.text || '');
    const d = node.getData() || {};
    this.contentTitle = String(d.contentTitle || '');
    this.contentDescription = String(d.contentDescription || '');
    this.resources = Array.isArray(d.resources) ? d.resources : [];
    this.sidebarOpen = true;
  }

  closeSidebar() { this.sidebarOpen = false; }

  ratingAvg = 0;
  ratingBreakdown: { score: number; count: number }[] = [];
  myRating = 0;
  newComment = '';
  submitting = false;
  exportOpen = false;
  versions: { id:number; createdAt:string; authorId:number }[] = [];
  exportIncludeResources = true;
  exportIncludeComments = true;
  exportPageSize: 'A4'|'Letter' = 'A4';
  exportOrientation: 'portrait'|'landscape' = 'portrait';
  exportVersionId: number | null = null;

  async loadRatings(): Promise<void> {
    if (!this.lpId) return;
    try {
      const r = await this.api.getLearningPathRatings(this.lpId);
      this.ratingAvg = Number(r?.avg || 0);
      this.ratingBreakdown = Array.isArray(r?.breakdown) ? r.breakdown : [];
    } catch {}
  }

  async loadVersions(): Promise<void> {
    if (!this.lpId) return;
    try {
      const r = await this.api.listVersions(this.lpId);
      this.versions = Array.isArray((r as any)?.items) ? (r as any).items : [];
    } catch {}
  }

  async onRate(score: number): Promise<void> {
    if (!this.lpId) return;
    try {
      await this.api.rateLearningPath(this.lpId, score);
      this.myRating = score;
      await this.loadRatings();
    } catch {}
  }

  async submitRoadmapComment(): Promise<void> {
    if (!this.lpId || !this.newComment) return;
    this.submitting = true;
    try {
      await this.api.postRoadmapComment(this.lpId, this.newComment);
      this.newComment = '';
      const r = await this.api.getLearningPathComments(this.lpId);
      this.comments = r.items || [];
    } catch {}
    finally { this.submitting = false; }
  }

  openExport(): void { this.exportOpen = true; }

  async startExport(): Promise<void> {
    const prevJSON = this.graph?.toJSON();
    if (this.lpId && this.exportVersionId) {
      try {
        const v = await this.api.getVersionDiagram(this.lpId, this.exportVersionId);
        this.loadGraphFromJSON(v?.diagramJSON);
      } catch {}
    }
    const style = document.createElement('style');
    style.id = 'print-style';
    style.innerHTML = `@page { size: ${this.exportPageSize} ${this.exportOrientation}; margin: 12mm; }
      @media print {
        body.print-omit-resources .details, body.print-omit-resources .resources { display:none !important; }
        body.print-omit-comments .reviews, body.print-omit-comments .comment-form { display:none !important; }
        .viewer .hero, .viewer .actions, .export-modal { display:none !important; }
        #graph-preview { height: 90vh !important; }
      }`;
    document.head.appendChild(style);
    const clsRes = this.exportIncludeResources ? 'remove' : 'add';
    const clsCom = this.exportIncludeComments ? 'remove' : 'add';
    document.body.classList[clsRes]('print-omit-resources');
    document.body.classList[clsCom]('print-omit-comments');
    window.print();
    setTimeout(async () => {
      document.body.classList.remove('print-omit-resources');
      document.body.classList.remove('print-omit-comments');
      const el = document.getElementById('print-style');
      if (el) el.remove();
      if (prevJSON) { try { this.graph?.fromJSON(prevJSON as any); } catch {} }
      if (this.lpId) {
        try { await this.api.logExport(this.lpId, { includeResources: this.exportIncludeResources, includeComments: this.exportIncludeComments, versionId: this.exportVersionId || undefined, pageSize: this.exportPageSize, orientation: this.exportOrientation }); } catch {}
      }
      this.exportOpen = false;
    }, 100);
  }
}
