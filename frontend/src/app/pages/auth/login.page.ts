import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth">
      <main class="container">
        <div class="card glass">
          <h1 class="center">Iniciar sesión</h1>
          <p class="subtitle center">Accede para continuar donde lo dejaste.</p>

          <form class="form" (ngSubmit)="onSubmit()" novalidate>
            <label class="field">
              <span>Correo electrónico</span>
              <input class="input" type="email" [(ngModel)]="email" name="email" placeholder="tu@correo.com" required />
              <small class="error" *ngIf="submitted && !isValidEmail(email)">Correo inválido</small>
            </label>
            <label class="field">
              <span>Contraseña</span>
              <div class="password-wrap">
                <input class="input" [type]="showPwd ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="••••••••" required minlength="8" />
                <button type="button" class="toggle" (click)="showPwd=!showPwd" aria-label="Mostrar/ocultar contraseña">{{showPwd? 'Ocultar' : 'Mostrar'}}</button>
              </div>
              <small class="error" *ngIf="submitted && !isStrongPassword(password)">Contraseña inválida</small>
            </label>

            <div class="row">
              <label class="checkbox">
                <input type="checkbox" [(ngModel)]="remember" name="remember" />
                <span>Recordarme</span>
              </label>
              <a class="link" routerLink="/recuperar">¿Olvidaste tu contraseña?</a>
            </div>

            <button class="btn primary" type="submit">Entrar</button>
          </form>

          <div class="sep"><span>o</span></div>
          <button class="btn oauth" type="button">
            <i class="pi pi-google"></i>
            <span>Continuar con Google</span>
          </button>

          <p class="switch center">¿No tienes cuenta? <a routerLink="/register">Crear cuenta</a></p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .auth { min-height: calc(100svh - var(--nav-height)); padding: 0 24px; color: var(--color-text); background: linear-gradient(180deg, rgba(167,139,250,.08), rgba(167,139,250,.02)); overflow: hidden; }
    .container { max-width: 560px; margin: 0 auto; padding-top: 24px; }
    .card { border-radius: 16px; border:1px solid rgba(255,255,255,.14); background: rgba(17,24,39,.45); backdrop-filter: blur(8px) saturate(120%); box-shadow: 0 24px 60px rgba(16,10,43,.35); padding: 20px; }
    h1 { margin:0 0 6px; font-size: 26px; }
    .subtitle { margin:0 0 16px; color: var(--color-muted); }
    .form { display:grid; gap: 12px; }
    .field { display:grid; gap:8px; }
    .field span { font-size:.9rem; color:#cbd5e1; }
    .input { width:100%; padding:12px 14px; border-radius:12px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; }
    .input:focus { outline:0; border-color: rgba(255,255,255,.28); box-shadow: 0 0 0 3px rgba(255,255,255,.12); }
    .password-wrap { position:relative; }
    .toggle { position:absolute; right:8px; top:8px; padding:6px 10px; border-radius:8px; border:0; background: rgba(255,255,255,.06); color: inherit; cursor:pointer; }
    .error { color:#fca5a5; font-size:.85rem; }
    .row { display:flex; align-items:center; justify-content:space-between; }
    .checkbox { display:flex; align-items:center; gap:8px; }
    .link { color:#c9b8ff; text-decoration:none; }
    .btn { appearance:none; border:none; border-radius: 10px; font-weight:600; cursor:pointer; }
    .primary { background: linear-gradient(90deg,#6d28d9,#5b21b6); color:#fff; border:1px solid rgba(255,255,255,.18); padding:10px 12px; width:100%; }
    .primary:hover { filter: brightness(1.05); }
    .sep { display:flex; align-items:center; justify-content:center; color: var(--color-muted); margin: 12px 0; }
    .oauth { background:#fff; color:#1f2937; border:1px solid rgba(0,0,0,.08); display:flex; align-items:center; gap:8px; justify-content:center; width: 100%; max-width: 360px; margin: 10px auto; padding:12px 14px; border-radius:12px; }
    .oauth:hover { background:#f3f4f6; }
    .pi-google { color:#4285F4; font-size:1.1rem; }
    .switch { margin-top: 12px; color: var(--color-muted); }
    .switch a { color: #c9b8ff; text-decoration: none; }
  `]
})
export class LoginPage {
  email = '';
  password = '';
  remember = true;
  showPwd = false;
  submitted = false;

  isValidEmail(v: string): boolean { return /.+@.+\..+/.test(String(v||'').toLowerCase()); }
  isStrongPassword(v: string): boolean { return (v||'').length >= 8; }

  onSubmit() {
    this.submitted = true;
    if (!this.isValidEmail(this.email) || !this.isStrongPassword(this.password)) return;
    alert('Login enviado');
  }
}