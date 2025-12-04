import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Graph, Node } from '@antv/x6';
import { ApiService, LearningPath } from '../../services/api.service';

@Component({
  selector: 'app-roadmap-community-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <header class="header">
        <h1 class="title">{{ summary().title || 'Roadmap' }}</h1>
        <p class="subtitle" *ngIf="summary().description">{{ summary().description }}</p>
        <div class="meta" *ngIf="summary().createdAt">Publicado: {{summary().createdAt | date:'medium'}}</div>
        <div class="actions">
          <button class="btn" (click)="toggleLike()">{{ liked() ? 'Quitar me gusta' : 'Me gusta' }}</button>
          <div class="rating">
            <button class="star" [class.active]="myRating()>=1" (click)="onRate(1)"><i class="pi pi-star-fill"></i></button>
            <button class="star" [class.active]="myRating()>=2" (click)="onRate(2)"><i class="pi pi-star-fill"></i></button>
            <button class="star" [class.active]="myRating()>=3" (click)="onRate(3)"><i class="pi pi-star-fill"></i></button>
            <button class="star" [class.active]="myRating()>=4" (click)="onRate(4)"><i class="pi pi-star-fill"></i></button>
            <button class="star" [class.active]="myRating()>=5" (click)="onRate(5)"><i class="pi pi-star-fill"></i></button>
            <span class="avg" *ngIf="ratingAvg()">{{ratingAvg() | number:'1.1-1'}}/5</span>
          </div>
        </div>
      </header>

      <div class="viewer-wrap">
        <div #graphEl class="graph"></div>
        <aside class="details" *ngIf="sidebarOpen() && activeNode() as an">
          <div class="details-header">
            <h3>{{activeNodeLabel() || 'Nodo'}}</h3>
            <button class="close" (click)="closeSidebar()">✕</button>
          </div>
          <div class="details-content">
            <div class="block" *ngIf="contentTitle()">
              <div class="muted">Título</div>
              <div class="value">{{contentTitle()}}</div>
            </div>
            <div class="block" *ngIf="contentDescription()">
              <div class="muted">Descripción</div>
              <div class="value desc">{{contentDescription()}}</div>
            </div>
            <div class="block" *ngIf="resources().length">
              <div class="muted">Recursos</div>
              <ul class="resources">
                <li *ngFor="let r of resources()"><span class="badge">{{r.type}}</span> <a [href]="r.url" target="_blank" rel="noopener">{{r.title || r.url}}</a></li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <div class="composer" *ngIf="api.authState()">
        <textarea [(ngModel)]="newComment" placeholder="Escribe un comentario" rows="3"></textarea>
        <div class="row"><button class="btn primary" (click)="submitComment()" [disabled]="submitting() || !newComment">Comentar</button><span class="muted" *ngIf="submitting()">Enviando…</span></div>
      </div>

      <div class="feed" *ngIf="comments().length">
        <article class="post" *ngFor="let c of comments()">
          <div class="avatar">{{ (c.username || '?').charAt(0) }}</div>
          <div class="content">
            <div class="meta"><span class="name">{{c.username}}</span> • <span class="date">{{c.createdAt | date:'medium'}}</span></div>
            <p>{{c.content}}</p>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .page{padding:16px;max-width:980px;margin:0 auto;color:var(--color-text)}
    .header{display:grid;gap:6px}
    .title{margin:0;font-size:1.6rem}
    .subtitle{margin:0;color:var(--color-muted)}
    .meta{color:var(--color-muted);font-size:.9rem}
    .actions{display:flex;align-items:center;gap:10px;margin-top:8px}
    .btn{appearance:none;border:none;border-radius:10px;padding:8px 10px;font-weight:600;background:rgba(255,255,255,.10);color:inherit}
    .btn.primary{background:linear-gradient(90deg,#6d28d9,#5b21b6);color:#fff;border:1px solid rgba(255,255,255,.18)}
    .rating{display:flex;align-items:center;gap:6px}
    .star{width:28px;height:28px;display:inline-grid;place-items:center;border-radius:8px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#c9b8ff}
    .star.active{background:linear-gradient(90deg,#6d28d9,#5b21b6);color:#fff;border-color:rgba(255,255,255,.28)}
    .avg{color:var(--color-muted);font-size:.9rem}
    .viewer-wrap{position:relative;margin-top:12px}
    .graph{width:100%;height:60vh;background:#f7f7fb;border:1px solid rgba(255,255,255,.12);border-radius:12px}
    .details{position:absolute;right:12px;top:12px;bottom:12px;width:340px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(17,24,39,.6);backdrop-filter:blur(6px) saturate(115%)}
    .details-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.12)}
    .details-content{padding:12px;display:grid;gap:12px}
    .block{display:grid;gap:6px}
    .muted{font-size:.82rem;color:#cbd5e1}
    .value{font-weight:600}
    .value.desc{white-space:pre-line}
    .resources{list-style:none;margin:0;padding:0;display:grid;gap:8px}
    .badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#fde047;color:#111827;font-weight:700;font-size:.8rem}
    .composer{display:grid;gap:8px;margin-top:12px}
    .composer textarea{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:inherit}
    .row{display:flex;align-items:center;gap:10px}
    .feed{display:grid;gap:10px;margin-top:12px}
    .post{display:grid;grid-template-columns:40px 1fr;gap:10px;align-items:flex-start;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:10px}
    .avatar{width:36px;height:36px;border-radius:999px;background:#111827;color:#fff;display:grid;place-items:center;font-weight:700}
    .meta{font-size:.85rem;color:#cbd5e1}
  `]
})
export class CommunityRoadmapDetailPage implements OnInit, OnDestroy {
  @ViewChild('graphEl', { static: true }) graphEl!: ElementRef<HTMLDivElement>;
  private graph!: Graph;
  summary = signal<LearningPath>({ id: 0, title: '' } as any);
  lpId = 0;
  sidebarOpen = signal(false);
  activeNode = signal<Node|undefined>(undefined);
  activeNodeLabel = signal('');
  contentTitle = signal('');
  contentDescription = signal('');
  resources = signal<{ type: string; title: string; url: string }[]>([]);
  comments = signal<{ id:number; content:string; createdAt:string; username:string }[]>([]);
  myRating = signal(0);
  ratingAvg = signal(0);
  liked = signal(false);
  newComment = '';
  submitting = signal(false);
  constructor(private route: ActivatedRoute, public api: ApiService) {}
  ngOnInit(): void {
    const idStr = this.route.snapshot.paramMap.get('id');
    this.lpId = idStr ? parseInt(idStr, 10) : 0;
    this.graph = new Graph({ container: this.graphEl.nativeElement, background: { color: '#f7f7fb' }, grid: { visible: false }, panning: true, mousewheel: { enabled: true, modifiers: 'ctrl' }, interacting: false });
    if (this.lpId) {
      this.api.getLearningPathSummary(this.lpId).then(s => this.summary.set(s as any)).catch(() => {});
      this.api.getLearningPathDiagram(this.lpId).then(d => this.loadGraphFromJSON(d?.diagramJSON)).catch(() => {});
      this.api.getLearningPathComments(this.lpId).then(r => this.comments.set(r.items || [])).catch(() => {});
      this.loadRatings();
    }
    this.graph.on('node:click', ({ node }) => { this.openSidebar(node as Node); });
    this.graph.on('node:contextmenu', ({ node, e }) => { e.preventDefault(); e.stopPropagation(); this.openSidebar(node as Node); });
    this.graph.on('blank:click', () => { this.closeSidebar(); });
  }
  ngOnDestroy(): void { this.graph?.dispose(); }
  private loadGraphFromJSON(json?: string) { if (!json) return; try { const data = JSON.parse(json); this.graph?.fromJSON(data); this.applySmooth(); } catch {} }
  private applySmooth() { const edges = this.graph?.getEdges?.() || []; edges.forEach(edge => { edge.setConnector('smooth'); edge.attr('line/stroke', '#A2B1C3'); edge.attr('line/strokeWidth', 2); edge.attr('line/targetMarker', ''); }); }
  private openSidebar(node: Node) { this.activeNode.set(node); this.activeNodeLabel.set(String(node.attr('label/text') || node.getData()?.text || '')); const d = node.getData() || {}; this.contentTitle.set(String(d.contentTitle || '')); this.contentDescription.set(String(d.contentDescription || '')); this.resources.set(Array.isArray(d.resources) ? d.resources : []); this.sidebarOpen.set(true); }
  closeSidebar() { this.sidebarOpen.set(false); }
  async loadRatings(): Promise<void> { if (!this.lpId) return; try { const r = await this.api.getLearningPathRatings(this.lpId); this.ratingAvg.set(Number(r?.avg || 0)); } catch {} }
  async onRate(score: number): Promise<void> { if (!this.lpId) return; try { await this.api.rateLearningPath(this.lpId, score); this.myRating.set(score); await this.loadRatings(); } catch {} }
  toggleLike() { this.liked.update(v => !v); }
  async submitComment(): Promise<void> { if (!this.lpId || !this.newComment) return; this.submitting.set(true); try { await this.api.postRoadmapComment(this.lpId, this.newComment); this.newComment = ''; const r = await this.api.getLearningPathComments(this.lpId); this.comments.set(r.items || []); } catch {} finally { this.submitting.set(false); } }
}
