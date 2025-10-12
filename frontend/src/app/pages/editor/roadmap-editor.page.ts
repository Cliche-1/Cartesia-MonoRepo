import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Graph, Shape } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { History } from '@antv/x6-plugin-history';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { Snapline } from '@antv/x6-plugin-snapline';

@Component({
  selector: 'app-roadmap-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="editor">
      <!-- Sidebar izquierda -->
      <aside class="sidebar" role="navigation" aria-label="Barra lateral del editor">
        <div class="nav-buttons" aria-label="Navegación del editor">
          <button class="nav-btn" [class.active]="panel==='components'" (click)="panel='components'" title="Componentes" [attr.aria-pressed]="panel==='components'">
            <i class="pi pi-palette"></i>
          </button>
          <button class="nav-btn" title="Herramientas" disabled>
            <i class="pi pi-sparkles"></i>
          </button>
          <button class="nav-btn" title="Buscar" disabled>
            <i class="pi pi-search"></i>
          </button>
          <button class="nav-btn" title="Configuración" disabled>
            <i class="pi pi-cog"></i>
          </button>
        </div>

        <!-- Panel desplegable de componentes -->
        <div class="components-panel" role="complementary" [attr.aria-expanded]="panel==='components'" *ngIf="panel==='components'">
          <div class="panel-title">COMPONENTS (DRAG & DROP)</div>
          <div class="components-list">
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'title')">
              <i class="pi pi-heading"></i> <span>Title</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'topic')">
              <i class="pi pi-circle"></i> <span>Topic</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'subtopic')">
              <i class="pi pi-badge"></i> <span>Sub Topic</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'paragraph')">
              <i class="pi pi-align-left"></i> <span>Paragraph</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'label')">
              <span style="font-weight:600">Aa</span> <span>Label</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'section')">
              <i class="pi pi-border"></i> <span>Section</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Canvas principal -->
      <div class="canvas-wrap" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
        <div #graphContainer class="graph" id="graph-container"></div>
        <div class="canvas-toolbar" aria-label="Herramientas del lienzo">
          <button class="tool" type="button" (click)="zoomOut()" aria-label="Alejar">−</button>
          <button class="tool" type="button" (click)="zoomIn()" aria-label="Acercar">+</button>
          <button class="tool" type="button" (click)="resetZoom()" aria-label="Restablecer zoom">100%</button>
          <span class="spacer" aria-hidden="true"></span>
          <button class="tool" type="button" (click)="saveGraph()" aria-label="Guardar">Guardar</button>
          <button class="tool" type="button" (click)="loadGraph()" aria-label="Cargar">Cargar</button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
    .editor { display:grid; grid-template-columns: 280px 1fr; height: calc(100vh - 72px); background: var(--color-bg); color: var(--color-text); }
    .sidebar { border-right: 1px solid rgba(255,255,255,.12); display:flex; flex-direction:column; gap: 12px; padding: 12px; }
    .nav-buttons { display:grid; gap:10px; }
    .nav-btn { border:0; border-radius:10px; background: rgba(255,255,255,.06); color: var(--color-text); padding: 10px; cursor:pointer; }
    .nav-btn:hover { background: rgba(255,255,255,.10); }
    .nav-btn.active { outline: 2px solid rgba(255,255,255,.2); }
    .components-panel { background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:12px; }
    .panel-title { font-size:.85rem; color: var(--color-muted); padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.12); }
    .components-list { display:grid; gap:8px; padding: 10px; }
    .component-item { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; cursor:grab; }
    .component-item:hover { background: rgba(255,255,255,.08); }

    .canvas-wrap { position:relative; }
    .graph { width: 100%; height: 100%; background: #f7f7fb; }
    .canvas-toolbar {
      position: absolute;
      top: 12px;
      right: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(17, 24, 39, .55);
      border: 1px solid rgba(255,255,255,.12);
      backdrop-filter: blur(6px) saturate(115%);
    }
    .tool { padding: 6px 10px; border: 0; border-radius: 8px; background: rgba(255,255,255,.06); color: inherit; cursor: pointer; }
    .tool:hover { background: rgba(255,255,255,.12); }
    .spacer { display:inline-block; width: 1px; height: 24px; background: rgba(255,255,255,.12); margin: 0 4px; }
    
    /* Ajustes X6 para replicar Example.js */
    .x6-widget-transform {
      margin: -1px 0 0 -1px;
      padding: 0;
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div {
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div:hover {
      background-color: #3dafe4;
    }
    .x6-widget-transform-active-handle {
      background-color: #3dafe4;
    }
    .x6-widget-transform-resize {
      border-radius: 0;
    }
    .x6-widget-selection-inner {
      border: 1px solid #239edd;
    }
    .x6-widget-selection-box {
      opacity: 0;
    }
    `
  ]
})
export class RoadmapEditorPage implements OnInit, OnDestroy {
  @ViewChild('graphContainer', { static: true }) graphEl!: ElementRef<HTMLDivElement>;
  private graph!: Graph;
  private dnd!: Dnd;
  panel: 'components' | 'tools' | 'search' | 'settings' = 'components';

  ngOnInit(): void {
    this.graph = new Graph({
      container: this.graphEl.nativeElement,
      grid: true,
      background: { color: '#f7f7fb' },
      panning: true,
      mousewheel: { enabled: true, zoomAtMousePosition: true, modifiers: ['ctrl'], minScale: 0.5, maxScale: 3 },
      // selección y transformación se controlan por plugins
      connecting: {
        // Conexiones suaves (curvas) en lugar de ortogonales
        connector: { name: 'smooth' },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: { radius: 20 },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
                // sin flecha
                targetMarker: ''
              },
            },
            zIndex: 0,
          })
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: { attrs: { fill: '#5F95FF', stroke: '#5F95FF' } }
        }
      }
    });

    // Configurar plugins por instancia
    this.graph.use(new Keyboard());
    this.graph.use(new Clipboard());
    this.graph.use(new History());
    this.graph.use(new Selection({ enabled: true, rubberband: true, showNodeSelectionBox: true }));
    this.graph.use(new Transform({ resizing: true, rotating: true }));
    this.graph.use(new Snapline({ enabled: true }));
    // Inicializar DnD
    this.dnd = new Dnd({ target: this.graph });

    // Atajos básicos
    // Atajos básicos
    this.graph.bindKey('del', () => {
      const cells = this.graph.getSelectedCells();
      if (cells.length) this.graph.removeCells(cells);
      return false;
    });
    this.graph.bindKey(['ctrl+z', 'meta+z'], () => { this.graph.undo(); return false; });
    this.graph.bindKey(['ctrl+y', 'meta+y'], () => { this.graph.redo(); return false; });
    this.graph.bindKey(['ctrl+c', 'meta+c'], () => {
      const cells = this.graph.getSelectedCells();
      if (cells.length) this.graph.copy(cells);
      return false;
    });
    this.graph.bindKey(['ctrl+v', 'meta+v'], () => { this.graph.paste(); return false; });

    // Doble click para editar texto simple
    this.graph.on('node:dblclick', ({ node }) => {
      const current = node.attr('label/text') || node.getData()?.text || '';
      const next = window.prompt('Editar texto', String(current));
      if (next !== null) {
        node.attr('label/text', next);
        node.setData({ ...(node.getData() || {}), text: next });
      }
    });

    // Estilizar aristas según tipo de conexión: topic-topic sólido, topic-subtopic punteado
    this.graph.on('edge:connected', ({ edge }) => {
      const sourceId = edge.getSourceCellId();
      const targetId = edge.getTargetCellId();
      const sourceCell = sourceId ? this.graph.getCellById(sourceId) : null;
      const targetCell = targetId ? this.graph.getCellById(targetId) : null;
      const sType = sourceCell?.getData()?.type;
      const tType = targetCell?.getData()?.type;

      // quitar flecha siempre
      edge.attr('line/targetMarker', '');

      if (sType === 'topic' && tType === 'topic') {
        // línea sólida
        edge.attr({
          line: {
            strokeDasharray: null,
            stroke: '#A2B1C3',
          }
        });
      } else if (
        (sType === 'topic' && tType === 'subtopic') ||
        (sType === 'subtopic' && tType === 'topic')
      ) {
        // línea punteada
        edge.attr({
          line: {
            strokeDasharray: '5 5',
            stroke: '#A2B1C3',
          }
        });
      } else {
        // por defecto: sólido
        edge.attr({
          line: {
            strokeDasharray: null,
            stroke: '#A2B1C3',
          }
        });
      }
    });

    // Puertos: ocultos por defecto (visibility), visibles en hover
    this.graph.on('node:mouseenter', () => {
      const container = this.graphEl.nativeElement as HTMLElement;
      const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
      for (let i = 0; i < ports.length; i++) {
        ports[i].style.visibility = 'visible';
      }
    });
    this.graph.on('node:mouseleave', () => {
      const container = this.graphEl.nativeElement as HTMLElement;
      const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
      for (let i = 0; i < ports.length; i++) {
        ports[i].style.visibility = 'hidden';
      }
    });

    // Sin estilizado dinámico de aristas: seguimos el estilo del createEdge()
  }

  ngOnDestroy(): void {
    this.graph?.dispose();
  }

  onDragStart(e: DragEvent, type: string) {
    if (!this.graph) return;
    const node = this.createNodeByType(type);
    this.dnd.start(node, e);
  }

  // Controles de zoom
  zoomIn(): void { this.graph?.zoom(0.1); }
  zoomOut(): void { this.graph?.zoom(-0.1); }
  resetZoom(): void { this.graph?.zoomTo(1); }

  // Guardar y cargar desde localStorage
  saveGraph(): void {
    try {
      const data = this.graph?.toJSON();
      localStorage.setItem('roadmap-editor-graph', JSON.stringify(data));
    } catch (e) { console.error('Error al guardar el roadmap', e); }
  }
  loadGraph(): void {
    try {
      const str = localStorage.getItem('roadmap-editor-graph');
      if (!str) return;
      const data = JSON.parse(str);
      this.graph?.fromJSON(data);
    } catch (e) { console.error('Error al cargar el roadmap', e); }
  }

  onDragOver(e: DragEvent) { e.preventDefault(); }
  onDrop(e: DragEvent) { e.preventDefault(); }

  private createNodeByType(type: string) {
    switch (type) {
      case 'title':
        return this.graph.createNode({
          shape: 'rect', width: 220, height: 64,
          attrs: {
            body: { fill: '#ffffff', stroke: '#e5e7eb', rx: 12, ry: 12 },
            label: { text: 'Title', fontSize: 24, fontWeight: 700, fill: '#1f2937' },
          },
          data: { text: 'Title', type: 'title' },
        });
      case 'topic':
        return this.graph.createNode({
          shape: 'rect', width: 220, height: 80,
          attrs: {
            body: { fill: '#eef2ff', stroke: '#c7d2fe', rx: 12, ry: 12 },
            label: { text: 'Topic', fontSize: 16, fontWeight: 600, fill: '#1f2937' },
          },
          ports: {
            groups: {
              top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff', style: { visibility: 'hidden' } } } },
              right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff', style: { visibility: 'hidden' } } } },
              bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff', style: { visibility: 'hidden' } } } },
              left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff', style: { visibility: 'hidden' } } } },
            },
            items: [
              { group: 'top' }, { group: 'right' }, { group: 'bottom' }, { group: 'left' }
            ],
          },
          data: { text: 'Topic', type: 'topic' },
        });
      case 'subtopic':
        return this.graph.createNode({
          shape: 'rect', width: 160, height: 56,
          attrs: {
            body: { fill: '#f5f3ff', stroke: '#ddd6fe', rx: 10, ry: 10, strokeDasharray: '2 2' },
            label: { text: 'Sub Topic', fontSize: 14, fontWeight: 600, fill: '#1f2937' },
          },
          ports: {
            groups: {
              top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff', style: { visibility: 'hidden' } } } },
              right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff', style: { visibility: 'hidden' } } } },
              bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff', style: { visibility: 'hidden' } } } },
              left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff', style: { visibility: 'hidden' } } } },
            },
            items: [
              { group: 'top' }, { group: 'right' }, { group: 'bottom' }, { group: 'left' }
            ],
          },
          data: { text: 'Sub Topic', type: 'subtopic' },
        });
      case 'paragraph':
        return this.graph.createNode({
          shape: 'rect', width: 320, height: 120,
          attrs: {
            body: { fill: '#ffffff', stroke: '#e5e7eb', rx: 8, ry: 8 },
            label: { text: 'Paragraph\nTexto de ejemplo', fontSize: 13, fontWeight: 500, fill: '#374151' },
          },
          data: { text: 'Paragraph', type: 'paragraph' },
        });
      case 'label':
        return this.graph.createNode({
          shape: 'rect', width: 120, height: 40,
          attrs: {
            body: { fill: '#ffffff', stroke: '#e5e7eb', rx: 999, ry: 999 },
            label: { text: 'Label', fontSize: 13, fontWeight: 600, fill: '#111827' },
          },
          data: { text: 'Label', type: 'label' },
        });
      case 'section':
        return this.graph.createNode({
          shape: 'rect', width: 380, height: 220,
          attrs: {
            body: { fill: 'transparent', stroke: '#9ca3af', strokeDasharray: '6 4', rx: 12, ry: 12 },
            label: { text: 'Section', fontSize: 12, fill: '#6b7280' },
          },
          data: { text: 'Section', type: 'section' },
        });
      default:
        return this.graph.createNode({ shape: 'rect', width: 100, height: 40, attrs: { label: { text: 'Item' } } });
    }
  }

  // Sin función de estilizado por tipo: seguimos el estilo definido en createEdge.
}