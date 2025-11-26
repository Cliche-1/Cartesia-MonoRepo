import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutor-materials',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="topbar" aria-label="Navegación">
      <div class="brand" routerLink="/tutor/aprende">Cartesia</div>
      <ul class="menu">
        <li><a routerLink="/tutor/aprende/profesores">Profesores</a></li>
        <li><a routerLink="/tutor/aprende/materiales" class="active">Materiales</a></li>
        <li><a routerLink="/tutor/aprende/conviertete-en-profesor">Conviértete en profesor</a></li>
        <li><a routerLink="/tutor/aprende#app">Obtén la app</a></li>
      </ul>
    </nav>

    <section class="hero">
      <div class="wrap">
        <h1 class="title">Descubre materiales y recursos</h1>
        <p class="desc">Cursos, artículos y vídeos curados por nivel y objetivo.</p>
      </div>
    </section>

    <section class="filters">
      <div class="filters-wrap">
        <label class="field">
          <span>Tipo</span>
          <select [(ngModel)]="type">
            <option value="all">Todos</option>
            <option value="curso">Curso</option>
            <option value="articulo">Artículo</option>
            <option value="video">Vídeo</option>
          </select>
        </label>
        <label class="field">
          <span>Nivel</span>
          <select [(ngModel)]="level">
            <option value="all">Todos</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </label>
        <label class="field grow">
          <span>Buscar</span>
          <input type="text" [(ngModel)]="q" placeholder="Tema o palabra clave" />
        </label>
      </div>
    </section>

    <section class="catalog">
      <div class="grid">
        <article class="mat" *ngFor="let m of filtered()">
          <div class="thumb"></div>
          <div class="body">
            <div class="kicker">{{m.type | titlecase}} · {{m.level | titlecase}}</div>
            <h3 class="name">{{m.title}}</h3>
            <p class="meta">{{m.source}} · {{m.length}}</p>
            <div class="actions">
              <a class="btn" [href]="m.url" target="_blank">Abrir</a>
              <a class="btn ghost" routerLink="/tutor/roadmap-chat" [queryParams]="{material:m.title}">Pedir guía</a>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .topbar { position: sticky; top: 0; z-index: 100; display:flex; align-items:center; justify-content:space-between; padding: 12px 16px; background: rgba(255,255,255,.85); backdrop-filter: blur(8px); border-bottom:1px solid #e5e7eb; }
    .brand { font-weight:800; letter-spacing:.02em; color:#111827; cursor:pointer; text-decoration:none; }
    .menu { list-style:none; display:flex; gap: 10px; margin:0; padding:0; flex-wrap: wrap; }
    .menu a { text-decoration:none; color:#111827; font-weight:600; padding: 8px 10px; border-radius:8px; }
    .menu a.active, .menu a:hover { background:#f3f4f6; }
    .hero .wrap { max-width: 1100px; margin: 0 auto; padding: 16px; }
    .title { margin:0 0 6px; font-weight:800; font-size: clamp(24px, 5vw, 36px); }
    .desc { margin:0; color:#374151; }
    .filters { background:#fff; color:#111827; padding: 12px 16px; border-top:1px solid #e5e7eb; }
    .filters-wrap { max-width: 1100px; margin:0 auto; display:flex; flex-wrap:wrap; gap: 10px; }
    .field { display:grid; gap:6px; }
    .grow { flex:1 1 320px; }
    input[type=text], select { width:100%; padding:10px 12px; border-radius:10px; border:1px solid #e5e7eb; }
    .catalog { background:#fff; color:#111827; padding: 16px; }
    .grid { max-width: 1100px; margin:0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
    .mat { border:1px solid #e5e7eb; border-radius:12px; background:#fff; display:flex; gap: 12px; padding: 12px; }
    .thumb { width: 120px; height: 80px; border-radius: 10px; background: linear-gradient(135deg,#bfdbfe,#60a5fa); }
    .kicker { font-size:12px; color:#6b7280; }
    .name { margin:4px 0; font-weight:700; }
    .meta { margin:0 0 10px; color:#6b7280; font-size:12px; }
    .actions { display:flex; gap: 8px; }
    .btn { padding:8px 10px; border-radius:10px; border:1px solid #111827; background:#111827; color:#fff; text-decoration:none; }
    .btn.ghost { background:#fff; color:#111827; }
  `]
})
export class TutorMaterialsPage {
  type: 'all' | 'curso' | 'articulo' | 'video' = 'all';
  level: 'all' | 'beginner' | 'intermediate' | 'advanced' = 'all';
  q = '';
  materials = [
    { type: 'curso', level: 'beginner', title: 'English Basics A1', source: 'Coursera', length: '10h', url: '#' },
    { type: 'articulo', level: 'intermediate', title: 'Improve your pronunciation', source: 'Blog Cartesia', length: '8 min', url: '#' },
    { type: 'video', level: 'intermediate', title: 'Business English phrases', source: 'YouTube', length: '12 min', url: '#' },
    { type: 'curso', level: 'advanced', title: 'IELTS Advanced Prep', source: 'Udemy', length: '14h', url: '#' },
    { type: 'articulo', level: 'beginner', title: 'Present simple guide', source: 'Medium', length: '5 min', url: '#' }
  ];
  filtered() {
    return this.materials.filter(m =>
      (this.type === 'all' || m.type === this.type) &&
      (this.level === 'all' || m.level === this.level) &&
      (!this.q || m.title.toLowerCase().includes(this.q.toLowerCase()))
    );
  }
}
