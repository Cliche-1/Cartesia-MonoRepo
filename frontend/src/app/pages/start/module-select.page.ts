import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-module-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="split">
      <div class="panel left" (click)="goRoadmaps()" tabindex="0" (keydown.enter)="goRoadmaps()" role="button" aria-label="Roadmaps">
        <div class="nav">
          <span class="brand">Cartesia</span>
          <div class="dots"><span></span><span></span><span></span></div>
        </div>
        <div class="content">
          <div class="tag">Roadmaps</div>
          <h1 class="title">Descubre, crea y comparte</h1>
          <p class="desc">Explora rutas profesionales y publica las tuyas.</p>
          <button class="cta ghost" (click)="goRoadmaps()">Entrar</button>
        </div>
        <div class="shape board"></div>
        <button class="arrow next" (click)="goRoadmaps()" aria-label="Ir a Roadmaps">›</button>
      </div>

      <div class="panel right" (click)="goTutors()" tabindex="0" (keydown.enter)="goTutors()" role="button" aria-label="Tutores y materiales">
        <div class="nav">
          <span class="brand">Cartesia</span>
          <div class="dots"><span></span><span></span><span></span></div>
        </div>
        <div class="content">
          <div class="tag">Tutores y materiales</div>
          <h1 class="title">Aprende con guía y recursos</h1>
          <p class="desc">Recomendaciones, materiales y acompañamiento.</p>
          <button class="cta ghost" (click)="goTutors()">Entrar</button>
        </div>
        <div class="shape shoe"></div>
        <button class="arrow prev" (click)="goTutors()" aria-label="Ir a Tutores">‹</button>
      </div>
    </section>
  `,
  styles: [`
    .split { position:relative; min-height:100vh; display:grid; grid-template-columns: 1fr 1fr; }
    .panel { position:relative; overflow:hidden; display:grid; place-items:center; padding: 24px; }
    .panel.left { background: #0ea5e9; color:#eaf6ff; }
    .panel.right { background: #f59e0b; color:#fff6e5; }
    .nav { position:absolute; top: 16px; left: 16px; right: 16px; display:flex; align-items:center; justify-content:space-between; opacity:.9; }
    .brand { font-weight:700; letter-spacing:.06em; }
    .dots { display:flex; gap:6px; }
    .dots span { width:6px; height:6px; border-radius:999px; background: rgba(255,255,255,.8); display:inline-block; }
    .content { max-width: 560px; text-align:left; z-index:2; }
    .tag { display:inline-block; padding:6px 12px; border-radius:999px; border:1px solid rgba(255,255,255,.6); background: rgba(255,255,255,.12); font-weight:700; margin-bottom:16px; }
    .title { margin:0 0 8px; font-weight:800; letter-spacing:-.02em; font-size: clamp(28px, 6vw, 60px); line-height: 1.05; }
    .desc { margin:0 0 12px; opacity:.9; font-size: 16px; }
    .cta { padding:10px 16px; border-radius:999px; border:1.5px solid rgba(255,255,255,.8); background: transparent; color: inherit; font-weight:700; cursor:pointer; }
    .cta.ghost:hover { background: rgba(255,255,255,.12); }
    .shape { position:absolute; z-index:1; filter: drop-shadow(0 18px 50px rgba(0,0,0,.25)); }
    .board { left: 50%; top: 46%; width: 280px; height: 520px; transform: translate(-50%, -50%) rotate(8deg); background: radial-gradient(circle at 50% 50%, #eaf6ff, #60a5fa 70%); border-radius: 140px; }
    .shoe { left: 50%; top: 60%; width: 520px; height: 260px; transform: translate(-50%, -50%) rotate(-10deg); background: radial-gradient(circle at 40% 40%, #fff6e5, #f59e0b 70%); border-radius: 60px; }
    .arrow { position:absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius:999px; border: 1.5px solid rgba(255,255,255,.9); background: transparent; color: inherit; font-size: 22px; font-weight:700; cursor:pointer; display:grid; place-items:center; }
    .arrow.next { right: 18px; }
    .arrow.prev { left: 18px; }
    .panel:focus-visible .cta { outline: 2px solid rgba(255,255,255,.8); outline-offset: 2px; }
    @media (max-width: 960px) { .split { grid-template-columns: 1fr; } .arrow { display:none; } .shape.board { top: 56%; } .shape.shoe { top: 64%; } }
  `]
})
export class ModuleSelectPage {
  constructor(private router: Router) {}
  goRoadmaps() { this.router.navigateByUrl('/home'); }
  goTutors() { this.router.navigateByUrl('/tutor/aprende'); }
}
