import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, UserInfo } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page profile">
      <header class="header">
        <h1>Mi perfil</h1>
        <p class="muted">Información básica de tu cuenta</p>
      </header>

      <ng-container *ngIf="authenticated(); else authPrompt">
        <div class="card glass">
          <div class="avatar">{{ initials() }}</div>
          <div class="info">
            <div class="row"><span class="label">Usuario</span><span class="value">{{ user()?.username }}</span></div>
            <div class="row"><span class="label">Correo</span><span class="value">{{ user()?.email }}</span></div>
          </div>
        </div>

        <div class="actions">
          <a class="btn ghost" routerLink="/mis-roadmaps">Mis roadmaps</a>
          <a class="btn primary" routerLink="/roadmaps/editor">Nuevo roadmap</a>
        </div>
      </ng-container>

      <ng-template #authPrompt>
        <div class="card glass center">
          <p>Inicia sesión para ver tu perfil.</p>
          <div class="cta">
            <a class="btn primary" routerLink="/login">Iniciar sesión</a>
            <a class="btn ghost" routerLink="/register">Crear cuenta</a>
          </div>
        </div>
      </ng-template>
    </section>
  `,
  styles: [
    `
    .page { padding: 24px; max-width: 860px; margin: 0 auto; }
    .header { margin-bottom: 16px; }
    .muted { color: var(--color-muted); }
    .card { display: grid; grid-template-columns: 80px 1fr; gap: 16px; align-items: center; padding: 16px; border-radius: 14px; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size: 1.4rem; background: linear-gradient(135deg, #c084fc, #a78bfa); color: #fff; box-shadow: 0 6px 16px rgba(124,58,237,.25); }
    .info { display:flex; flex-direction:column; gap: 8px; }
    .row { display:flex; align-items:center; gap: 10px; }
    .label { width: 80px; color: var(--color-muted); }
    .value { font-weight: 600; }
    .center { text-align: center; }
    .cta { display:flex; gap: 12px; justify-content:center; margin-top: 8px; }
    .actions { display:flex; gap: 12px; margin-top: 16px; }
    `
  ]
})
export class ProfilePage implements OnInit {
  private _user = signal<UserInfo | null>(null);
  constructor(public api: ApiService) {}

  async ngOnInit() {
    if (!this.api.isAuthenticated()) return;
    try {
      const info = await this.api.me();
      this._user.set(info);
    } catch (err) {
      // En caso de error, mantener la vista estable sin romper UI
      console.error('Error cargando perfil:', err);
    }
  }

  user() { return this._user(); }
  authenticated() { return this.api.isAuthenticated(); }
  initials() {
    const name = this._user()?.username || 'U';
    return name.slice(0, 2).toUpperCase();
  }
}