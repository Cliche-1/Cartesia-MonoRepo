import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Graph, Node } from '@antv/x6';
// Backend controls removidos: preview solo usa datos locales

@Component({
  selector: 'app-roadmap-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="viewer">
      <header class="viewer-header">
        <h2>Previsualización del Roadmap</h2>
        <p>Vista estática e interactiva. Haz clic en un nodo para ver sus detalles.</p>
      </header>

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
    </section>
  `,
  styles: [`
    .viewer { display:grid; gap:14px; padding:16px; color: var(--color-text); }
    .viewer-header h2 { margin:0; font-size:1.4rem; }
    .viewer-header p { margin:0; color: var(--color-muted); }
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
  constructor() {}

  ngOnInit(): void {
    this.graph = new Graph({
      container: this.graphEl.nativeElement,
      background: { color: '#f7f7fb' },
      grid: { visible: false },
      panning: true,
      mousewheel: { enabled: true, modifiers: 'ctrl' },
      interacting: false,
    });

    this.loadGraph();
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
}