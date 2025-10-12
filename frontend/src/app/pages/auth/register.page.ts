import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth">
      <main class="container">
        <div class="card glass">
          <h1 class="center">Crear cuenta</h1>
          <p class="subtitle center">Publica y sigue roadmaps, guarda tu progreso y más.</p>

          <form class="form" (ngSubmit)="onSubmit()" novalidate>
            <label class="field">
              <span>Nombre</span>
              <input class="input" type="text" [(ngModel)]="name" name="name" placeholder="Tu nombre" required />
              <small class="error" *ngIf="submitted && !name">Ingresa tu nombre</small>
            </label>
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
              <small class="hint">Mínimo 8 caracteres</small>
              <small class="error" *ngIf="submitted && !isStrongPassword(password)">Usa al menos 8 caracteres</small>
            </label>
            <label class="field">
              <span>Confirmar contraseña</span>
              <input class="input" [type]="showPwd ? 'text' : 'password'" [(ngModel)]="confirm" name="confirm" placeholder="••••••••" required />
              <small class="error" *ngIf="submitted && password!==confirm">Las contraseñas no coinciden</small>
            </label>

            <label class="checkbox">
              <input type="checkbox" [(ngModel)]="terms" name="terms" />
              <span>Acepto los <a routerLink="/terminos">Términos</a> y la <a routerLink="/privacidad">Privacidad</a></span>
            </label>
            <small class="error" *ngIf="submitted && !terms">Debes aceptar los términos</small>

            <button class="btn primary" type="submit">Registrarse</button>
          </form>

          <div class="sep"><span>o</span></div>
          <button class="btn oauth" type="button">
            <i class="pi pi-google"></i>
            <span>Continuar con Google</span>
          </button>

          <p class="switch center">¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a></p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .auth { min-height: calc(100svh - var(--nav-height)); padding: 0 24px; color: var(--color-text); background: linear-gradient(180deg, rgba(167,139,250,.08), rgba(167,139,250,.02)); overflow: hidden; }
    .container { max-width: 560px; margin: 0 auto; padding-top: 24px; }
    .card { border-radius: 16px; border:1px solid rgba(255,255,255,.14); background: rgba(17,24,39,.45); backdrop-filter: blur(8px) saturate(120%); box-shadow: 0 24px 60px rgba(16,10,43,.35); padding: 20px; }
    .glass { }
    h1 { margin:0 0 6px; font-size: 26px; }
    .subtitle { margin:0 0 16px; color: var(--color-muted); }
    .form { display:grid; gap: 12px; }
    .field { display:grid; gap:8px; }
    .field span { font-size:.9rem; color:#cbd5e1; }
    .input { width:100%; padding:12px 14px; border-radius:12px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: inherit; }
    .input:focus { outline:0; border-color: rgba(255,255,255,.28); box-shadow: 0 0 0 3px rgba(255,255,255,.12); }
    .password-wrap { position:relative; }
    .toggle { position:absolute; right:8px; top:8px; padding:6px 10px; border-radius:8px; border:0; background: rgba(255,255,255,.06); color: inherit; cursor:pointer; }
    .hint { color: var(--color-muted); }
    .error { color:#fca5a5; font-size:.85rem; }
    .checkbox { display:flex; align-items:center; gap:8px; }
    .checkbox a { color:#c9b8ff; text-decoration:none; }
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
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  confirm = '';
  terms = false;
  showPwd = false;
  submitted = false;
  loading = false;

  constructor(private api: ApiService, private router: Router) {}

  isValidEmail(v: string): boolean {
    return /.+@.+\..+/.test(String(v||'').toLowerCase());
  }
  isStrongPassword(v: string): boolean { return (v||'').length >= 8; }

  async onSubmit() {
    this.submitted = true;
    if (!this.name || !this.isValidEmail(this.email) || !this.isStrongPassword(this.password) || this.password !== this.confirm || !this.terms) {
      return;
    }
    try {
      this.loading = true;
      const res = await this.api.register({ email: this.email, username: this.name, password: this.password });
      this.api.token = res?.token || null;
      await this.router.navigateByUrl('/roadmaps/editor');
    } catch (err: any) {
      alert('Error al registrar');
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}