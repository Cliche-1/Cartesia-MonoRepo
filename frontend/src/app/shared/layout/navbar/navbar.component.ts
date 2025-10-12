import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="nav">
      <!-- Brand -->
      <a class="brand" routerLink="/" aria-label="Ir al inicio">
        <svg class="logo" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="cartesiaGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#c084fc"/>
              <stop offset="100%" stop-color="#a78bfa"/>
            </linearGradient>
          </defs>
          <!-- Fondo cuadrado redondeado -->
          <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#cartesiaGrad)"/>
          <!-- Símbolo C estilizado (negativo sobre el fondo) -->
          <path d="M44 20c-8 0-14 6-14 12s6 12 14 12h-6c-6 0-12-6-12-12s6-12 12-12h6z" fill="#ffffff"/>
          <path d="M40 24c-6 0-10 4-10 8s4 8 10 8h-4c-4 0-8-4-8-8s4-8 8-8h4z" fill="url(#cartesiaGrad)" opacity=".18"/>
        </svg>
        <span class="name">Cartesia</span>
      </a>

      <!-- Primary navigation -->
      <nav class="links" aria-label="Navegación principal">
        <!-- Roadmaps dropdown -->
        <div class="dropdown" [class.open]="roadmapsOpen()">
          <button
            class="dropdown-trigger"
            type="button"
            (click)="toggleRoadmaps()"
            (blur)="closeRoadmapsOnBlur($event)"
            aria-haspopup="menu"
            [attr.aria-expanded]="roadmapsOpen()"
          >
            <i class="pi pi-map"></i>
            <span>Roadmaps</span>
            <i class="pi pi-chevron-down caret"></i>
          </button>
          <div class="menu" role="menu">
            <a role="menuitem" routerLink="/roadmaps/oficiales" class="item">
              <i class="pi pi-verified"></i>
              <div class="info">
                <span class="title">Roadmaps Oficiales</span>
                <span class="desc">Roadmaps validados y curados por la comunidad</span>
              </div>
            </a>
            <a role="menuitem" routerLink="/roadmaps/ia" class="item">
              <i class="pi pi-robot"></i>
              <i class="pi pi-sparkles"></i>
              <div class="info">
                <span class="title">Roadmaps IA</span>
                <span class="desc">Genera roadmaps personalizados con Inteligencia Artificial</span>
              </div>
            </a>
            <a role="menuitem" routerLink="/roadmaps/comunidad" class="item">
              <i class="pi pi-users"></i>
              <div class="info">
                <span class="title">Roadmaps de la Comunidad</span>
                <span class="desc">Explora roadmaps creados por otros usuarios</span>
              </div>
            </a>
            <a role="menuitem" routerLink="/roadmaps/editor" class="item">
              <i class="pi pi-pencil"></i>
              <div class="info">
                <span class="title">Editor de Roadmaps</span>
                <span class="desc">Crea y organiza tu roadmap visualmente</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Tutor IA dropdown -->
        <div class="dropdown" [class.open]="tutorOpen()">
          <button
            class="dropdown-trigger"
            type="button"
            (click)="toggleTutor()"
            (blur)="closeTutorOnBlur($event)"
            aria-haspopup="menu"
            [attr.aria-expanded]="tutorOpen()"
          >
            <i class="pi pi-graduation-cap"></i>
            <span>Tutor IA</span>
            <i class="pi pi-chevron-down caret"></i>
          </button>
          <div class="menu" role="menu">
            <a role="menuitem" routerLink="/tutor/aprende" class="item">
              <i class="pi pi-sparkles"></i>
              <div class="info">
                <span class="title">Aprende con IA</span>
                <span class="desc">Recibe una guía personalizada acerca de cualquier tema</span>
              </div>
            </a>
            <a role="menuitem" routerLink="/tutor/roadmap-chat" class="item">
              <i class="pi pi-comments"></i>
              <div class="info">
                <span class="title">Roadmap Chat</span>
                <span class="desc">Obtén orientación y consejos sobre un roadmap específico</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Pro badge/button (al lado de Tutor IA) -->
        <a class="pro-badge" routerLink="/pro" title="Desbloquea funciones premium">
          <i class="pi pi-star-fill"></i>
          <span>Pro</span>
        </a>
      </nav>

      <!-- Actions -->
      <div class="actions">
        <ng-container *ngIf="!api.isAuthenticated(); else authActions">
          <a class="btn ghost" routerLink="/login">Iniciar sesión</a>
          <a class="btn primary" routerLink="/register">Registrarse</a>
        </ng-container>
        <ng-template #authActions>
          <div class="dropdown" [class.open]="accountOpen()">
            <button
              class="dropdown-trigger btn primary"
              type="button"
              (click)="toggleAccount()"
              (blur)="closeAccountOnBlur($event)"
              aria-haspopup="menu"
              [attr.aria-expanded]="accountOpen()"
            >
              <i class="pi pi-user"></i>
              <span>Cuenta</span>
              <i class="pi pi-chevron-down caret"></i>
            </button>
            <div class="menu right" role="menu">
              <a role="menuitem" routerLink="/" class="item">
                <i class="pi pi-user"></i>
                <span>Perfil</span>
              </a>
              <a role="menuitem" routerLink="/" class="item">
                <i class="pi pi-users"></i>
                <span>Amigos</span>
              </a>
              <a role="menuitem" routerLink="/roadmaps/comunidad" class="item">
                <i class="pi pi-list"></i>
                <span>Mis roadmaps</span>
              </a>
              <a role="menuitem" routerLink="/roadmaps/editor" class="item">
                <i class="pi pi-plus"></i>
                <span>Nuevo roadmap</span>
              </a>
              <button role="menuitem" type="button" class="item plain" (click)="logout()">
                <i class="pi pi-sign-out"></i>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </ng-template>
      </div>
    </header>
  `,
  styles: [
    `
    .nav { position: relative; z-index: 100; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 24px; padding: 0 24px; height: var(--nav-height); backdrop-filter: blur(6px) saturate(115%); background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)); border-bottom: 1px solid rgba(255,255,255,.15); box-shadow: 0 8px 20px rgba(124,58,237,.08); }
    .brand { display:flex; align-items:center; gap:10px; font-weight:700; color: var(--color-text, #222); text-decoration: none; }
    .logo { width:28px; height:28px; border-radius:8px; display:block; box-shadow: 0 4px 12px rgba(167,139,250,.25); }
    .brand:hover .logo { filter: brightness(1.06); }
    .name { font-family: 'Montserrat', sans-serif; letter-spacing:.2px; background: linear-gradient(135deg, #c084fc, #a78bfa); -webkit-background-clip: text; background-clip: text; color: transparent; }

    .links { display:flex; align-items:center; justify-content:flex-start; gap: 16px; padding: 0; margin: 0; }
    .dropdown { position: relative; }
    .dropdown-trigger { display:flex; align-items:center; gap:8px; padding: 8px 12px; border-radius: 10px; background: transparent; border: 0; color: var(--color-text); cursor:pointer; }
    .dropdown-trigger:hover { background: rgba(255,255,255,.08); }
    .caret { font-size: 0.8rem; opacity: .7; }
    .dropdown.open .caret { transform: rotate(180deg); transition: transform .2s ease; }

    .menu { position:absolute; top: calc(100% + 8px); left:0; min-width: 320px; border-radius:12px; border:1px solid rgba(255,255,255,.15); background: var(--color-bg-2); color: var(--color-text); box-shadow: 0 22px 40px rgba(16,10,43,.45); padding:8px; opacity:0; pointer-events:none; transform: translateY(6px) scale(.98); transition: opacity .16s ease, transform .16s ease; backdrop-filter: saturate(120%) blur(4px); }
    .dropdown.open .menu { opacity:1; pointer-events:auto; transform: translateY(0) scale(1); }
    .item { display:flex; align-items:flex-start; gap:10px; padding:10px; border-radius:10px; color: var(--color-text); text-decoration: none; }
    .item:hover { background: rgba(255,255,255,.08); }
    .item.plain { background: transparent; border: 0; width: 100%; text-align: left; cursor: pointer; }
    .item i { font-size: 1.1rem; color: var(--tui-primary); }
    .info { display:flex; flex-direction:column; }
    .title { font-weight:600; }
    .desc { font-size:.85rem; color: var(--color-muted); }

    .actions { display:flex; align-items:center; gap:12px; }

    .menu.right { left: auto; right: 0; }

    .pro-badge { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px; background: transparent; color: var(--color-text); text-decoration:none; }
    .pro-badge:hover { background: rgba(255,255,255,.08); }
    .pro-badge i { color: var(--tui-primary); }

    @media (max-width: 960px) {
      .nav { grid-template-columns: auto auto; padding: 0 12px; }
      .links { display:none; }
      .actions .ghost { display:none; }
    }
    `
  ]
})
export class NavbarComponent {
  roadmapsOpen = signal(false);
  tutorOpen = signal(false);
  accountOpen = signal(false);

  constructor(public api: ApiService, private router: Router) {}

  toggleRoadmaps() { this.roadmapsOpen.update(v => !v); }
  toggleTutor() { this.tutorOpen.update(v => !v); }
  toggleAccount() { this.accountOpen.update(v => !v); }

  closeRoadmapsOnBlur(event: FocusEvent) {
    const target = event.target as HTMLElement;
    setTimeout(() => {
      if (!target.parentElement?.classList.contains('open')) return;
      this.roadmapsOpen.set(false);
    }, 120);
  }

  closeTutorOnBlur(event: FocusEvent) {
    const target = event.target as HTMLElement;
    setTimeout(() => {
      if (!target.parentElement?.classList.contains('open')) return;
      this.tutorOpen.set(false);
    }, 120);
  }

  closeAccountOnBlur(event: FocusEvent) {
    const target = event.target as HTMLElement;
    setTimeout(() => {
      if (!target.parentElement?.classList.contains('open')) return;
      this.accountOpen.set(false);
    }, 120);
  }

  goToAccount() {
    // Placeholder: redirige al inicio hasta que exista una página de perfil
    this.router.navigateByUrl('/');
  }

  logout() {
    this.api.token = null;
    this.accountOpen.set(false);
    this.router.navigateByUrl('/');
  }
}