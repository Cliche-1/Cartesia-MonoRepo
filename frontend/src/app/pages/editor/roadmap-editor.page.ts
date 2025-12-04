import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Graph, Shape, Node } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { History } from '@antv/x6-plugin-history';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { Snapline } from '@antv/x6-plugin-snapline';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-roadmap-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="editor">
      <!-- Barra superior del editor -->
      <div class="editor-topbar" role="toolbar" aria-label="Barra superior del editor">
        <div class="left">
          <button type="button" class="tb-btn ghost" (click)="closeEditor()" title="Cerrar">✕</button>
          <div class="title-wrap">
            <input class="title-input" type="text" [(ngModel)]="metaTitle" (ngModelChange)="onTitleChange()" placeholder="Roadmap sin título" />
          </div>
          <select class="lp-select" [ngModel]="learningPathId" (ngModelChange)="onSelectRoadmap($event)">
            <option [ngValue]="null">Nuevo roadmap</option>
            <option *ngFor="let p of paths" [ngValue]="p.id">Editar: {{ p.title }}</option>
          </select>
          <input class="subtitle-input" type="text" [(ngModel)]="metaSubtitle" placeholder="Añade una descripción" />
        </div>
        <div class="right">
          <select class="visibility" [(ngModel)]="visibility" (ngModelChange)="onEditorVisibilityChange()" title="Visibilidad">
            <option value="private">Solo visible para mí</option>
            <option value="public">Público</option>
          </select>
          <button type="button" class="tb-btn link" (click)="previewRoadmap()">Previsualización</button>
          <button type="button" class="tb-btn" (click)="openExportPreview()" [disabled]="!learningPathId">Exportar</button>
          <button type="button" class="tb-btn primary" (click)="saveAll()" [disabled]="savingBackend || !canEdit">{{ savingBackend ? 'Guardando…' : 'Guardar' }}</button>
          <span class="save-status" *ngIf="saveMsg" [class.ok]="saveOK" [class.err]="saveErr">{{saveMsg}}</span>
        </div>
      </div>
      <!-- Sidebar izquierda colapsada -->
      <aside class="sidebar" role="navigation" aria-label="Barra lateral del editor">
        <div class="nav-buttons" aria-label="Navegación del editor">
          <button class="nav-btn" [class.active]="panel==='components'" (click)="togglePanel('components')" title="Componentes" [attr.aria-pressed]="panel==='components'">
            <i class="pi pi-palette"></i>
          </button>
          <button class="nav-btn" title="Herramientas" disabled>
            <i class="pi pi-sparkles"></i>
          </button>
          <button class="nav-btn" title="Buscar" disabled>
            <i class="pi pi-search"></i>
          </button>
          <button class="nav-btn" [class.active]="panel==='settings'" (click)="togglePanel('settings')" title="Colaboración" [attr.aria-pressed]="panel==='settings'">
            <i class="pi pi-users"></i>
          </button>
        </div>
      </aside>

      <!-- Flyout a la derecha del sidebar -->
      <div class="flyout-panel" role="complementary" *ngIf="panel==='components'" [attr.aria-expanded]="panel==='components'">
        <header class="flyout-header">
          <h3>Componentes</h3>
          <button class="close" type="button" (click)="closePanel()" aria-label="Cerrar">✕</button>
        </header>
        <div class="flyout-content">
          <div class="components-list">
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'title')">
              <i class="pi pi-book"></i> <span>Título</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'topic')">
              <i class="pi pi-circle"></i> <span>Tema</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'subtopic')">
              <i class="pi pi-bookmark"></i> <span>Subtema</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'paragraph')">
              <i class="pi pi-align-left"></i> <span>Párrafo</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'label')">
              <i class="pi pi-tag"></i> <span>Etiqueta</span>
            </div>
            <div class="component-item" draggable="true" (dragstart)="onDragStart($event, 'section')">
              <i class="pi pi-folder-open"></i> <span>Sección</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flyout-panel" role="complementary" *ngIf="panel==='settings'" [attr.aria-expanded]="panel==='settings'">
        <header class="flyout-header">
          <h3>Colaboración</h3>
          <button class="close" type="button" (click)="closePanel()" aria-label="Cerrar">✕</button>
        </header>
        <div class="flyout-content">
          <div class="collab-status">
            <span class="badge" [class.ok]="canEdit" [class.err]="!canEdit">{{ canEdit ? 'Editando (bloqueado por ti)' : (saveMsg || 'Modo lectura') }}</span>
            <div class="row">
              <button type="button" class="btn" (click)="onLock()" [disabled]="lockBusy || canEdit || !api.isAuthenticated()">Tomar control</button>
              <button type="button" class="btn ghost" (click)="onUnlock()" [disabled]="lockBusy || !canEdit">Liberar control</button>
            </div>
          </div>

          <hr class="opt-sep" />

          <div class="collab-list">
            <div class="list-title">Colaboradores</div>
            <div class="item" *ngFor="let c of collaborators">
              <div class="name">Usuario {{c.userId}}</div>
              <div class="role">{{c.role}}</div>
            </div>
            <button type="button" class="btn" (click)="loadCollaborators()" [disabled]="!learningPathId">Actualizar</button>
          </div>

          <hr class="opt-sep" />

          <div class="invite-form">
            <div class="list-title">Invitar</div>
            <label class="field">
              <span>Email</span>
              <input type="email" [(ngModel)]="inviteEmail" placeholder="correo@ejemplo.com" />
            </label>
            <label class="field">
              <span>Rol</span>
              <select [(ngModel)]="inviteRole">
                <option value="editor">Editor</option>
                <option value="collaborator">Colaborador</option>
                <option value="reader">Lector</option>
              </select>
            </label>
            <button type="button" class="btn accent" (click)="invite()" [disabled]="!learningPathId || !inviteEmail">Enviar invitación</button>
            <div class="hint" *ngIf="inviteToken">Token generado: {{inviteToken}}</div>
          </div>
        </div>
      </div>

      <!-- Inspector derecho: editar nombre del nodo seleccionado -->
      <div class="inspector-panel" role="complementary" *ngIf="inspectorOpen && selectedNode">
        <header class="flyout-header">
          <h3>Editor</h3>
          <button class="close" type="button" (click)="closeInspector()" aria-label="Cerrar">✕</button>
        </header>
        <div class="tabs">
          <button type="button" class="tab" [class.active]="inspectorTab==='properties'" (click)="inspectorTab='properties'">Propiedades</button>
          <button type="button" class="tab" [class.active]="inspectorTab==='resources'" (click)="inspectorTab='resources'">Recursos</button>
        </div>
        <div class="flyout-content">
          <ng-container *ngIf="inspectorTab==='properties'">
            <label class="field">
              <span>Nombre</span>
              <input type="text" [(ngModel)]="nodeName" (ngModelChange)="onNameChange()" placeholder="Nombre del nodo" />
            </label>
            <div class="opt-section">
              <div class="opt-title">Tamaño de fuente</div>
              <div class="opt-grid">
                <button type="button" class="opt-btn" *ngFor="let fs of fontSizes"
                  [class.active]="activeFontSize===fs.size" (click)="setFontSize(fs.size)" [attr.aria-label]="fs.key">
                  {{fs.key}}
                </button>
              </div>
            </div>

            <hr class="opt-sep" />

            <div class="opt-section">
              <div class="opt-title">Color del nodo</div>
              <div class="opt-grid">
                <button type="button" class="opt-btn color"
                  *ngFor="let c of colors" [class.active]="activeColor===c.key"
                  [style.background]="c.hex" (click)="setNodeColor(c.key)" [attr.aria-label]="c.key">
                  {{c.key}}
                </button>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="inspectorTab==='resources'">
            <label class="field">
              <span>Título</span>
              <input type="text" [(ngModel)]="contentTitle" (ngModelChange)="onContentTitleChange()" placeholder="Ingresa título" />
            </label>
            <label class="field">
              <span>Descripción</span>
              <textarea rows="6" [(ngModel)]="contentDescription" (ngModelChange)="onContentDescChange()" placeholder=""></textarea>
            </label>

            <div class="links-list">
              <div class="link-card" *ngFor="let r of resourceItems; let i = index">
                <select [(ngModel)]="r.type" (ngModelChange)="onResourceChange(i, 'type', r.type)">
                  <option *ngFor="let t of resourceTypes" [value]="t">{{t}}</option>
                </select>
                <input type="text" [(ngModel)]="r.title" (ngModelChange)="onResourceChange(i, 'title', r.title)" placeholder="Título del recurso" />
                <input type="text" [(ngModel)]="r.url" (ngModelChange)="onResourceChange(i, 'url', r.url)" placeholder="URL del recurso" />
                <button type="button" class="remove" (click)="removeResource(i)">Eliminar</button>
              </div>
              <button type="button" class="add" (click)="addResource()">Añadir Enlace</button>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Canvas principal -->
      <div class="canvas-wrap" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
        <div #graphContainer class="graph" id="graph-container" (contextmenu)="onContextMenu($event)"></div>
      </div>
    </section>
  `,
  styles: [
    `
    .editor { position:relative; display:grid; grid-template-rows: 56px 1fr; grid-template-columns: 56px 1fr; height: 100vh; background: var(--color-bg); color: var(--color-text); }
    .editor-topbar {
      grid-row: 1;
      grid-column: 1 / -1;
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 16px;
      height: 56px;
      border-radius: 0;
      background: var(--color-bg-2, #0b1220);
      border-bottom: 1px solid rgba(255,255,255,.12);
      backdrop-filter: none;
      z-index: 20;
    }
    .editor-topbar .left { display:flex; align-items:center; gap:10px; }
    .editor-topbar .right { display:flex; align-items:center; gap:10px; }
    .tb-btn { padding: 8px 12px; border:0; border-radius:10px; background: rgba(255,255,255,.08); color: inherit; cursor:pointer; }
    .tb-btn:hover { background: rgba(255,255,255,.14); }
    .tb-btn.ghost { background: transparent; border:1px solid rgba(255,255,255,.18); }
    .tb-btn.icon { width:36px; height:36px; display:grid; place-items:center; }
    .tb-btn.link { background: rgba(255,255,255,.06); }
    .tb-btn.primary { background: #0b1220; color:#eef; border:1px solid rgba(255,255,255,.18); }
    .title-wrap { display:flex; align-items:center; gap:8px; }
    .title-input { width: 220px; max-width: 260px; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; font-weight:700; }
    .subtitle-input { width: 280px; max-width: 320px; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; }
    .visibility { padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; }
    .lp-select { padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; max-width: 220px; }
    .sidebar { width:56px; border-right: 1px solid rgba(255,255,255,.12); display:flex; flex-direction:column; align-items:center; gap: 8px; padding: 8px; }
    .nav-buttons { display:grid; gap:8px; }
    .nav-btn { width:40px; height:40px; border:0; border-radius:10px; background: rgba(255,255,255,.06); color: var(--color-text); cursor:pointer; display:grid; place-items:center; }
    .nav-btn:hover { background: rgba(255,255,255,.10); }
    .nav-btn.active { outline: 2px solid rgba(255,255,255,.2); }
    .flyout-panel { position:absolute; left:56px; top:56px; bottom:12px; width:280px; z-index:10; border-right:1px solid rgba(255,255,255,.12); background: var(--color-bg-2, #0f172a); color: var(--color-text); box-shadow: 0 22px 40px rgba(16,10,43,.35); }
    .flyout-header { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.12); }
    .flyout-header h3 { margin:0; font-size:.95rem; }
    .flyout-header .close { width:32px; height:32px; border:0; border-radius:8px; background: rgba(255,255,255,.06); color: inherit; cursor: pointer; }
    .flyout-header .close:hover { background: rgba(255,255,255,.12); }
    .flyout-content { padding:10px; }
    .components-list { display:grid; gap:8px; }
    .component-item { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; cursor:grab; }
    .component-item:hover { background: rgba(255,255,255,.08); }

    /* Inspector derecho */
    .inspector-panel { position:absolute; right:12px; top:56px; bottom:12px; width:320px; z-index:10; border-left:1px solid rgba(255,255,255,.12); background: var(--color-bg-2, #0f172a); color: var(--color-text); box-shadow: 0 22px 40px rgba(16,10,43,.35); }
    .flyout-header { padding:12px 14px; }
    .flyout-content { padding:12px; display:grid; gap:14px; }
    .field { display:grid; gap:8px; }
    .field span { font-size:.82rem; color:#cbd5e1; letter-spacing:.02em; }
    .field input, .field textarea { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; transition: box-shadow .15s ease, border-color .15s ease; }
    .field input:focus, .field textarea:focus { outline: 0; border-color: rgba(255,255,255,.28); box-shadow: 0 0 0 3px rgba(255,255,255,.12); }
    .field textarea { min-height:120px; resize: vertical; }

    /* Inspector options */
    .opt-section { display:grid; gap:10px; margin-top:6px; }
    .opt-title { font-size:.8rem; color: #cbd5e1; text-transform: uppercase; letter-spacing: .04em; }
    .opt-grid { display:flex; flex-wrap:wrap; gap:10px; }
    .opt-btn { min-width:44px; height:34px; padding:0 12px; border:0; border-radius:10px; background: rgba(255,255,255,.08); color: inherit; cursor:pointer; font-weight:600; }
    .opt-btn:hover { background: rgba(255,255,255,.14); }
    .opt-btn.active { outline: 2px solid rgba(255,255,255,.22); }
    .opt-btn.color { color:#111827; }
    .opt-sep { border:0; border-top:1px solid rgba(255,255,255,.12); margin:8px 0; }

    /* Tabs */
    .tabs { display:flex; gap:8px; padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.12); justify-content:center; }
    .tab { padding:8px 14px; border:0; border-radius:999px; background: rgba(255,255,255,.10); color: inherit; cursor:pointer; font-weight:600; }
    .tab.active { background: rgba(255,255,255,.20); box-shadow: 0 6px 14px rgba(0,0,0,.18) inset; }

    /* Resources */
    .links-list { display:grid; gap:12px; margin-top:6px; }
    .link-card { display:grid; gap:10px; padding:12px; border-radius:12px; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); }
    .link-card select, .link-card input { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.04); color: inherit; }
    .link-card select {
      appearance: none;
      background-color: #0b1220;
      color: #e5e7eb;
      border-color: #334155;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }
    .link-card select:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgba(96,165,250,.25);
    }
    .link-card select option { background: #0b1220; color: #e5e7eb; }
    .link-card .remove { width:100%; padding:10px 12px; border:0; border-radius:10px; background: rgba(244,63,94,.18); color:#fee; cursor:pointer; }
    .link-card .remove:hover { background: rgba(244,63,94,.28); }
    .links-list .add { width:100%; padding:10px 12px; border:0; border-radius:10px; background: rgba(255,255,255,.10); color: inherit; cursor:pointer; }
    .links-list .add:hover { background: rgba(255,255,255,.16); }
    .collab-status { display:grid; gap:10px; }
    .collab-status .badge { display:inline-block; padding:6px 10px; border-radius:999px; font-size:.82rem; background: rgba(255,255,255,.06); }
    .collab-status .badge.ok { background: rgba(22,163,74,.18); color:#dcfce7; }
    .collab-status .badge.err { background: rgba(244,63,94,.18); color:#fee; }
    .collab-status .row { display:flex; gap:10px; }
    .btn { padding:8px 10px; border:0; border-radius:10px; background: rgba(255,255,255,.08); color: inherit; cursor:pointer; }
    .btn.ghost { background: transparent; border:1px solid rgba(255,255,255,.18); }
    .btn.accent { background: linear-gradient(90deg,#6d28d9,#5b21b6); color:#fff; border:1px solid rgba(255,255,255,.18); }
    .collab-list { display:grid; gap:8px; }
    .collab-list .list-title { font-weight:600; color:#cbd5e1; }
    .collab-list .item { display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:10px; background: rgba(255,255,255,.06); }
    .invite-form { display:grid; gap:10px; }
    .invite-form .hint { font-size:.8rem; color:#cbd5e1; }

    .canvas-wrap { position:relative; grid-row: 2; grid-column: 2; }
    .graph { width: 100%; height: 100%; background: #f7f7fb; }
    /* Mini toolbar removida para usar solo la barra superior */
    
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
    .save-status { margin-left: 8px; font-size: .85rem; }
    .save-status.ok { color: #86efac; }
    .save-status.err { color: #fca5a5; }
    `
  ]
})
export class RoadmapEditorPage implements OnInit, OnDestroy {
  @ViewChild('graphContainer', { static: true }) graphEl!: ElementRef<HTMLDivElement>;
  private graph!: Graph;
  private dnd!: Dnd;
  // Metadatos del roadmap
  metaTitle = 'Roadmap';
  metaSubtitle = '';
  visibility: 'private' | 'public' = 'private';
  panel: 'components' | 'tools' | 'search' | 'settings' | null = null;
  inspectorOpen = false;
  selectedNode?: Node;
  nodeName = '';
  inspectorTab: 'properties' | 'resources' = 'properties';
  activeFontSize?: number;
  activeColor?: string;

  contentTitle = '';
  contentDescription = '';
  resourceItems: { type: string; title: string; url: string }[] = [];
  resourceTypes = ['Artículo', 'Video', 'Curso', 'Documentación', 'Herramienta', 'Otro'];

  fontSizes = [
    { key: 'S', size: 12 },
    { key: 'M', size: 14 },
    { key: 'L', size: 16 },
    { key: 'XL', size: 20 },
    { key: 'XXL', size: 24 },
  ];
  colors = [
    { key: 'A', hex: '#111827' },
    { key: 'B', hex: '#fde047' },
    { key: 'C', hex: '#fef08a' },
    { key: 'D', hex: '#86efac' },
    { key: 'E', hex: '#93c5fd' },
    { key: 'F', hex: '#9ca3af' },
    { key: 'G', hex: '#fda4af' },
    { key: 'H', hex: '#e5e7eb' },
  ];

  learningPathId: number | null = null;
  paths: { id: number; title: string }[] = [];
  loadingBackend = false;
  savingBackend = false;
  saveMsg = '';
  saveOK = false;
  saveErr = false;
  canEdit = true;
  lockBusy = false;
  collaborators: { userId:number; role:string }[] = [];
  inviteEmail = '';
  inviteRole: 'editor'|'collaborator'|'reader' = 'collaborator';
  inviteToken = '';

  constructor(private router: Router, public api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Leer ?lp=ID desde la URL para fijar el roadmap a editar
    const lpParam = this.route.snapshot.queryParamMap.get('lp');
    if (lpParam) {
      const parsed = Number(lpParam);
      if (!Number.isNaN(parsed) && parsed > 0) {
        this.learningPathId = parsed;
      }
    }
    this.fetchLearningPaths();
    this.graph = new Graph({
      container: this.graphEl.nativeElement,
      grid: true,
      background: { color: '#f7f7fb' },
      interacting: () => this.canEdit,
      // Panning solo con botón derecho
      panning: { enabled: true, eventTypes: ['rightMouseDown'] },
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
    // Desactivar el resizing manual para nodos de tipo 'topic' y 'subtopic'
    this.graph.use(new Transform({
      resizing: {
        enabled: function(node: Node) {
          const t = node?.getData()?.type;
          return t !== 'topic' && t !== 'subtopic';
        }
      },
      rotating: true,
    }));
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
    this.graph.bindKey(['ctrl+s','meta+s'], () => { this.saveAll(); return false; });

    // Doble click para editar texto simple
    this.graph.on('node:dblclick', ({ node }) => {
      const current = node.attr('label/text') || node.getData()?.text || '';
      const next = window.prompt('Editar texto', String(current));
      if (next !== null) {
        node.attr('label/text', next);
        node.setData({ ...(node.getData() || {}), text: next });
      }
    });

    // Abrir inspector al seleccionar nodo; cerrar al deseleccionar
    this.graph.on('node:selected', ({ node }) => {
      this.syncInspectorFromNode(node as Node);
      this.inspectorOpen = true;
    });
    // Bloquear el pan del lienzo en clic derecho sobre nodos
    this.graph.on('node:mousedown', ({ e }) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    // Abrir inspector con clic derecho sobre el nodo
    this.graph.on('node:contextmenu', ({ node, e }) => {
      e.preventDefault();
      e.stopPropagation();
      this.syncInspectorFromNode(node as Node);
      this.inspectorOpen = true;
    });
    this.graph.on('node:unselected', () => {
      const cells = this.graph.getSelectedCells();
      if (!cells.length) {
        this.selectedNode = undefined;
        this.inspectorOpen = false;
      }
    });
    // Sincronizar inspector con selección actual (soporta cambiar rápido entre nodos)
    this.graph.on('selection:changed', () => {
      const cells = this.graph.getSelectedCells();
      const firstNode = cells.find((c) => c.isNode());
      if (firstNode && firstNode.isNode()) {
        this.syncInspectorFromNode(firstNode as Node);
        this.inspectorOpen = true;
      } else {
        this.selectedNode = undefined;
        this.inspectorOpen = false;
      }
    });
    this.graph.on('blank:click', () => { this.selectedNode = undefined; this.inspectorOpen = false; });

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
    if (this.learningPathId && this.api.isAuthenticated()) { this.api.unlockLearningPath(this.learningPathId).catch(() => {}); }
    this.graph?.dispose();
  }

  onDragStart(e: DragEvent, type: string) {
    if (!this.graph) return;
    const node = this.createNodeByType(type);
    this.dnd.start(node, e);
  }

  onContextMenu(e: MouseEvent) { e.preventDefault(); }

  togglePanel(next: 'components' | 'tools' | 'search' | 'settings') {
    this.panel = this.panel === next ? null : next;
  }
  closePanel() { this.panel = null; }

  closeInspector() { this.inspectorOpen = false; }
  onNameChange() {
    if (!this.selectedNode) return;
    this.selectedNode.attr('label/text', this.nodeName);
    this.selectedNode.setData({ ...(this.selectedNode.getData() || {}), text: this.nodeName });
  }

  onContentTitleChange() {
    if (!this.selectedNode) return;
    this.patchNodeData({ contentTitle: this.contentTitle });
  }
  onContentDescChange() {
    if (!this.selectedNode) return;
    this.patchNodeData({ contentDescription: this.contentDescription });
  }
  addResource() {
    this.resourceItems = [
      ...this.resourceItems,
      { type: 'Article', title: '', url: '' }
    ];
    this.persistResources();
  }
  removeResource(i: number) {
    this.resourceItems = this.resourceItems.filter((_, idx) => idx !== i);
    this.persistResources();
  }
  onResourceChange(i: number, field: 'type' | 'title' | 'url', value: string) {
    const next = [...this.resourceItems];
    (next[i] as any)[field] = value;
    this.resourceItems = next;
    this.persistResources();
  }

  setFontSize(size: number) {
    if (!this.selectedNode) return;
    this.selectedNode.attr('label/fontSize', size);
    this.activeFontSize = size;
  }

  setNodeColor(key: string) {
    if (!this.selectedNode) return;
    const found = this.colors.find(c => c.key === key);
    if (!found) return;
    this.applyNodeColorHex(found.hex);
    this.activeColor = key;
  }

  private applyNodeColorHex(hex: string) {
    if (!this.selectedNode) return;
    this.selectedNode.attr('body/fill', hex);
    const dark = this.isDarkHex(hex);
    this.selectedNode.attr('label/fill', dark ? '#ffffff' : '#111827');
  }

  private isDarkHex(hex: string): boolean {
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2), 16);
    const g = parseInt(h.substring(2,4), 16);
    const b = parseInt(h.substring(4,6), 16);
    const luminance = 0.2126*r + 0.7152*g + 0.0722*b;
    return luminance < 140; // simple threshold
  }

  private syncInspectorFromNode(node: Node) {
    this.selectedNode = node;
    this.nodeName = String(node.attr('label/text') || node.getData()?.text || '');
    const fs = Number(node.attr('label/fontSize'));
    this.activeFontSize = isNaN(fs) ? this.defaultFontSize(node) : fs;
    const fill = String(node.attr('body/fill') || '');
    const foundColor = this.colors.find(c => c.hex.toLowerCase() === fill.toLowerCase());
    this.activeColor = foundColor?.key;

    const d = node.getData() || {};
    this.contentTitle = String(d.contentTitle || '');
    this.contentDescription = String(d.contentDescription || '');
    this.resourceItems = Array.isArray(d.resources) ? d.resources.map((r: any) => ({ type: String(r.type||'Article'), title: String(r.title||''), url: String(r.url||'') })) : [];
  }

  private defaultFontSize(node: Node): number {
    const t = node.getData()?.type;
    switch (t) {
      case 'title': return 24;
      case 'paragraph': return 13;
      case 'label': return 13;
      case 'subtopic': return 14;
      case 'topic': return 16;
      case 'section': return 12;
      default: return 14;
    }
  }

  private patchNodeData(patch: Record<string, any>) {
    if (!this.selectedNode) return;
    const current = this.selectedNode.getData() || {};
    this.selectedNode.setData({ ...current, ...patch });
  }
  private persistResources() {
    this.patchNodeData({ resources: this.resourceItems });
  }

  // Controles de zoom
  zoomIn(): void { this.graph?.zoom(0.1); }
  zoomOut(): void { this.graph?.zoom(-0.1); }
  resetZoom(): void { this.graph?.zoomTo(1); }

  // Guardar y cargar desde localStorage
  saveGraph(): void {}
  saveMeta(): void {}
  loadMeta(): void {}
  saveAll(): void {
    if (this.api.isAuthenticated()) {
      // Si no hay LP seleccionado, crear uno primero
      if (!this.learningPathId) {
        const title = this.metaTitle || 'Roadmap';
        const description = this.metaSubtitle || '';
        const visibility = this.visibility;
        this.api.createLearningPath({ title, description, visibility })
          .then((lp) => {
            this.learningPathId = lp?.id || null;
            if (this.learningPathId) this.saveToBackend();
          })
          .catch((e) => console.error('Error creando roadmap', e));
        return;
      }
      this.saveToBackend();
    } else {
      this.saveOK = false; this.saveErr = false; this.saveMsg = 'Inicia sesión para guardar en la base de datos';
    }
  }
  loadGraph(): void {}

  async fetchLearningPaths(): Promise<void> {
    try {
      const mine = await this.api.listMyLearningPaths();
      this.paths = (mine || []).map((p: any) => ({ id: Number(p.id), title: String(p.title || '') }));
      
      if (this.learningPathId) {
        this.loadFromBackend();
        await this.tryLock();
        await this.loadCollaborators();
      }
    } catch (e) { console.error('Error al cargar mis roadmaps', e); }
  }

  async tryLock(): Promise<void> {
    if (!this.learningPathId) { this.canEdit = false; return; }
    if (!this.api.isAuthenticated()) { this.canEdit = false; this.saveMsg = 'Modo lectura (no autenticado)'; this.saveErr = true; return; }
    try {
      await this.api.lockLearningPath(this.learningPathId);
      this.canEdit = true;
      this.saveMsg = 'Bloqueado por ti'; this.saveOK = true; this.saveErr = false;
    } catch (e: any) {
      this.canEdit = false;
      if (e?.status === 423) { this.saveMsg = 'Bloqueado por otro usuario. Modo lectura'; this.saveErr = true; }
      else if (e?.status === 403) { this.saveMsg = 'Sin permiso de edición'; this.saveErr = true; }
      else { this.saveMsg = 'No se pudo bloquear'; this.saveErr = true; }
    }
  }

  async onLock(): Promise<void> {
    if (!this.learningPathId) return;
    this.lockBusy = true;
    try {
      await this.api.lockLearningPath(this.learningPathId);
      this.canEdit = true;
      this.saveMsg = 'Bloqueado por ti'; this.saveOK = true; this.saveErr = false;
    } catch (e: any) {
      this.canEdit = false;
      if (e?.status === 423) { this.saveMsg = 'Bloqueado por otro usuario'; this.saveErr = true; }
      else if (e?.status === 403) { this.saveMsg = 'Sin permiso de edición'; this.saveErr = true; }
      else { this.saveMsg = 'No se pudo bloquear'; this.saveErr = true; }
    } finally { this.lockBusy = false; }
  }

  async onUnlock(): Promise<void> {
    if (!this.learningPathId) return;
    this.lockBusy = true;
    try {
      await this.api.unlockLearningPath(this.learningPathId);
      this.canEdit = false;
      this.saveMsg = 'Modo lectura'; this.saveOK = false; this.saveErr = false;
    } catch {}
    finally { this.lockBusy = false; }
  }

  async loadCollaborators(): Promise<void> {
    if (!this.learningPathId) return;
    try {
      const r = await this.api.listCollaborators(this.learningPathId);
      const items = Array.isArray((r as any)?.items) ? (r as any).items : [];
      this.collaborators = items.map((x: any) => ({ userId: Number(x.userId), role: String(x.role) }));
    } catch {}
  }

  async invite(): Promise<void> {
    if (!this.learningPathId || !this.inviteEmail) return;
    try {
      const r = await this.api.inviteCollaborator(this.learningPathId, this.inviteEmail, this.inviteRole);
      this.inviteToken = String((r as any)?.token || '');
    } catch {}
  }

  async loadFromBackend(): Promise<void> {
    if (!this.learningPathId) return;
    try {
      this.loadingBackend = true;
      const data = await this.api.getDiagram(this.learningPathId);
      this.graph?.clearCells();
      this.graph?.fromJSON(data as any);
    } catch (e) { console.error('Error al cargar diagrama', e); }
    finally { this.loadingBackend = false; }
  }

  async saveToBackend(): Promise<void> {
    if (!this.learningPathId) return;
    try {
      this.savingBackend = true;
      try {
        await this.api.updateLearningPath(this.learningPathId, { title: this.metaTitle, description: this.metaSubtitle, visibility: this.visibility });
      } catch {}
      const json = this.graph?.toJSON() as any;
      const ok = await this.api.updateDiagram(this.learningPathId, json);
      if (ok) {
        this.saveOK = true; this.saveErr = false; this.saveMsg = 'Guardado';
      }
    } catch (e: any) {
      // Si no eres autor del LP seleccionado, crea uno nuevo y guarda allí
      if (e?.status === 403 || String(e)?.toLowerCase().includes('forbidden')) {
        try {
          const title = this.metaTitle || 'Roadmap';
          const description = this.metaSubtitle || '';
          const visibility = this.visibility;
          const lp = await this.api.createLearningPath({ title, description, visibility });
          this.learningPathId = lp?.id || null;
          if (this.learningPathId) {
            const json2 = this.graph?.toJSON() as any;
            const ok2 = await this.api.updateDiagram(this.learningPathId, json2);
            if (ok2) {
              this.saveOK = true; this.saveErr = false; this.saveMsg = 'Creado y guardado en tu cuenta';
            }
          }
        } catch (err) {
          console.error('Guardar con fallback falló', err);
          this.saveOK = false; this.saveErr = true; this.saveMsg = 'No autorizado para guardar en ese roadmap';
        }
      } else {
        console.error('Error al guardar diagrama', e);
        this.saveOK = false; this.saveErr = true; this.saveMsg = 'Error al guardar';
      }
    }
    finally { this.savingBackend = false; }
  }

  async onTitleChange(): Promise<void> {
    if (!this.learningPathId) return;
    try {
      await this.api.updateLearningPath(this.learningPathId, { title: this.metaTitle });
      this.saveMsg = 'Título guardado'; this.saveOK = true; this.saveErr = false;
    } catch {}
  }

  async onEditorVisibilityChange(): Promise<void> {
    if (!this.learningPathId) return;
    try {
      await this.api.updateLearningPath(this.learningPathId, { visibility: this.visibility });
      this.saveMsg = 'Visibilidad actualizada'; this.saveOK = true; this.saveErr = false;
    } catch (e) {
      this.saveMsg = 'No se pudo actualizar visibilidad'; this.saveOK = false; this.saveErr = true;
    }
  }

  onSelectRoadmap(id: number | null): void {
    this.learningPathId = (id && Number(id) > 0) ? Number(id) : null;
    if (this.learningPathId) {
      this.loadFromBackend();
      this.tryLock();
      this.loadCollaborators();
    } else {
      this.graph?.clearCells();
      this.canEdit = true;
      this.saveMsg = '';
      this.saveOK = false;
      this.saveErr = false;
    }
  }

  previewRoadmap(): void {
    const url = this.router.createUrlTree(['/roadmaps/preview'], { queryParams: { lp: this.learningPathId } }).toString();
    window.open(url, '_blank');
  }

  openExportPreview(): void {
    if (!this.learningPathId) return;
    const url = this.router.createUrlTree(['/roadmaps/preview'], { queryParams: { lp: this.learningPathId, export: 1 } }).toString();
    window.open(url, '_blank');
  }

  closeEditor(): void {
    this.router.navigateByUrl('/');
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
            label: { text: 'Título', fontSize: 24, fontWeight: 700, fill: '#1f2937' },
          },
          data: { text: 'Título', type: 'title', contentTitle: '', contentDescription: '', resources: [] },
        });
      case 'topic':
        return this.graph.createNode({
          shape: 'rect', width: 220, height: 80,
          attrs: {
            body: { fill: '#eef2ff', stroke: '#c7d2fe', rx: 12, ry: 12 },
            label: { text: 'Tema', fontSize: 16, fontWeight: 600, fill: '#1f2937' },
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
          data: { text: 'Tema', type: 'topic', contentTitle: '', contentDescription: '', resources: [] },
        });
      case 'subtopic':
        return this.graph.createNode({
          shape: 'rect', width: 160, height: 56,
          attrs: {
            body: { fill: '#f5f3ff', stroke: '#ddd6fe', rx: 10, ry: 10, strokeDasharray: '2 2' },
            label: { text: 'Subtema', fontSize: 14, fontWeight: 600, fill: '#1f2937' },
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
          data: { text: 'Subtema', type: 'subtopic', contentTitle: '', contentDescription: '', resources: [] },
        });
      case 'paragraph':
        return this.graph.createNode({
          shape: 'rect', width: 320, height: 120,
          attrs: {
            body: { fill: '#ffffff', stroke: '#e5e7eb', rx: 8, ry: 8 },
            label: { text: 'Párrafo\nTexto de ejemplo', fontSize: 13, fontWeight: 500, fill: '#374151' },
          },
          data: { text: 'Párrafo', type: 'paragraph', contentTitle: '', contentDescription: '', resources: [] },
        });
      case 'label':
        return this.graph.createNode({
          shape: 'rect', width: 120, height: 40,
          attrs: {
            body: { fill: '#ffffff', stroke: '#e5e7eb', rx: 999, ry: 999 },
            label: { text: 'Etiqueta', fontSize: 13, fontWeight: 600, fill: '#111827' },
          },
          data: { text: 'Etiqueta', type: 'label', contentTitle: '', contentDescription: '', resources: [] },
        });
      case 'section':
        return this.graph.createNode({
          shape: 'rect', width: 380, height: 220,
          attrs: {
            body: { fill: 'transparent', stroke: '#9ca3af', strokeDasharray: '6 4', rx: 12, ry: 12 },
            label: { text: 'Sección', fontSize: 12, fill: '#6b7280' },
          },
          data: { text: 'Sección', type: 'section', contentTitle: '', contentDescription: '', resources: [] },
        });
      default:
        return this.graph.createNode({ shape: 'rect', width: 100, height: 40, attrs: { label: { text: 'Elemento' } } });
    }
  }

  // Sin función de estilizado por tipo: seguimos el estilo definido en createEdge.
}
