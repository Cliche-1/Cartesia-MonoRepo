import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutor-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth">
      <main class="container">
        <div class="card">
          <h1 class="center">Registrarse como profesor/a</h1>
          <button class="oauth google" type="button">
            <span class="icon">G</span>
            Registrarse con Google
          </button>
          <button class="oauth facebook" type="button">
            <span class="icon">f</span>
            Registrarse con Facebook
          </button>
          <div class="sep">o</div>
          <form class="form" (ngSubmit)="onSubmit()" novalidate>
            <label class="field">
              <span>Correo electrónico</span>
              <input class="input" type="email" [(ngModel)]="email" name="email" placeholder="Tu correo electrónico" required />
            </label>
            <label class="field">
              <span>Contraseña</span>
              <div class="password-wrap">
                <input class="input" [type]="showPwd ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Tu contraseña" required />
                <button type="button" class="toggle" (click)="showPwd=!showPwd" aria-label="Mostrar/ocultar">{{showPwd? 'Ocultar' : 'Mostrar'}}</button>
              </div>
            </label>
            <label class="checkbox">
              <input type="checkbox" [(ngModel)]="remember" name="remember" />
              <span>Recuérdame</span>
            </label>
            <button class="btn primary" type="submit" [disabled]="loading">{{ loading ? 'Creando...' : 'Empezar' }}</button>
            <small class="terms">Al hacer clic en Empezar, aceptas las Condiciones de uso y la Política de privacidad.</small>
            <small class="error" *ngIf="error">{{error}}</small>
            <div class="alt" *ngIf="showLoginCta"><a routerLink="/login">Inicia sesión con este correo</a></div>
          </form>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .auth { min-height: calc(100svh - var(--nav-height)); padding: 0 24px; color:#111827; background:#fff; }
    .container { max-width: 480px; margin: 0 auto; padding-top: 24px; }
    .card { border-radius: 16px; border:1px solid #e5e7eb; background:#fff; box-shadow: 0 12px 24px rgba(0,0,0,.08); padding: 20px; }
    h1 { margin:0 0 12px; font-size: 22px; text-align:center; }
    .oauth { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 12px; border-radius:12px; border:1px solid #e5e7eb; background:#fff; color:#111827; font-weight:600; margin-bottom: 8px; }
    .oauth.google .icon { color:#4285F4; }
    .oauth.facebook .icon { color:#1877F2; }
    .oauth:hover { background:#f9fafb; }
    .sep { text-align:center; color:#6b7280; margin: 10px 0; }
    .form { display:grid; gap: 12px; }
    .field { display:grid; gap:6px; }
    .input { width:100%; padding:12px 14px; border-radius:12px; border:1px solid #e5e7eb; }
    .password-wrap { position:relative; }
    .toggle { position:absolute; right:8px; top:8px; padding:6px 10px; border-radius:8px; border:1px solid #e5e7eb; background:#fff; color:#111827; cursor:pointer; }
    .checkbox { display:flex; align-items:center; gap:8px; }
    .btn.primary { background:#f472b6; color:#fff; border:0; padding:10px 12px; border-radius:12px; font-weight:700; }
    .terms { color:#6b7280; text-align:center; }
    .error { color:#ef4444; text-align:center; }
    .alt { text-align:center; margin-top: 8px; }
  `]
})
export class TutorRegisterPage {
  email = '';
  password = '';
  remember = false;
  showPwd = false;
  loading = false;
  error = '';
  showLoginCta = false;
  constructor(private api: ApiService, private router: Router) {}
  private isValidEmail(v: string): boolean { return /.+@.+\..+/.test(String(v||'').toLowerCase()); }
  private isStrongPassword(v: string): boolean { return (v||'').length >= 8; }
  async onSubmit() {
    this.error = '';
    this.showLoginCta = false;
    if (!this.isValidEmail(this.email) || !this.isStrongPassword(this.password)) {
      this.error = 'Verifica tu correo y una contraseña de mínimo 8 caracteres';
      return;
    }
    try {
      this.loading = true;
      let username = String(this.email.split('@')[0] || 'profesor').slice(0, 32);
      let res = await this.api.register({ email: this.email, username, password: this.password });
      this.api.token = res?.token || null;
      if (this.remember) { /* token ya queda en localStorage */ }
      await this.router.navigateByUrl('/tutor/aprende');
    } catch (err: any) {
      if (err?.status === 409) {
        try {
          const suffix = Math.random().toString(36).slice(2, 6);
          const alt = (String(this.email.split('@')[0]) + '-' + suffix).slice(0, 32);
          const res2 = await this.api.register({ email: this.email, username: alt, password: this.password });
          this.api.token = res2?.token || null;
          await this.router.navigateByUrl('/tutor/aprende');
          return;
        } catch (err2: any) {
          this.error = 'Este correo ya está registrado. Inicia sesión o usa otro correo';
          this.showLoginCta = true;
          console.error(err2);
        }
      } else {
        this.error = 'No se pudo registrar. Inténtalo de nuevo';
        console.error(err);
      }
    } finally {
      this.loading = false;
    }
  }
}
