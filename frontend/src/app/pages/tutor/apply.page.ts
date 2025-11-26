import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-tutor-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <nav class="topbar" aria-label="Navegación">
      <div class="brand" routerLink="/tutor/aprende">Cartesia</div>
      <ul class="menu">
        <li><a routerLink="/tutor/aprende/profesores">Profesores</a></li>
        <li><a routerLink="/tutor/aprende/materiales">Materiales</a></li>
        <li><a routerLink="/tutor/aprende/conviertete-en-profesor" class="active">Conviértete en profesor</a></li>
      </ul>
    </nav>

    <section class="step">
      <h2>Step 1: Learn about Cartesia</h2>
      <p class="muted">Estos contenidos cubren lo básico de enseñar en Cartesia.</p>
      <div class="panel passion">
        <h3>Turn your Passion Into Profits</h3>
        <p>Enseña con tus propios términos. Puedes generar ingresos enseñando a tu ritmo.</p>
        <ul>
          <li>Average Annual Earnings for Active Educators*: <b>$21,881</b></li>
          <li>Average Annual Earnings for High Volume Educators*: <b>$55,898</b></li>
          <li>Average Annual Earnings for Active Seller Orgs*: <b>$78,916</b></li>
          <li>Average Annual Earnings for High Volume Seller Orgs*: <b>$172,994</b></li>
        </ul>
      </div>
      <div class="learn-grid">
        <a class="card yellow">How Cartesia Works<br/><small>Quién puede enseñar, qué enseñar, cómo y cuándo.</small></a>
        <a class="card">Applying to Cartesia</a>
        <div class="video">
          <button class="play" type="button" aria-label="Play">▶</button>
        </div>
      </div>
    </section>

    <section class="step">
      <h2>Step 2: Fill out your application</h2>
      <p class="muted">Todos los campos son obligatorios.</p>
      <form class="form" (ngSubmit)="saveStep2()" novalidate>
        <label class="field">
          <span>Public Teacher Name</span>
          <input type="text" [(ngModel)]="publicName" name="publicName" placeholder="Nombre público" required />
          <small class="hint">Lo verán las familias en tu perfil. Puede cambiarse luego.</small>
        </label>
        <label class="field">
          <span>Legal Name</span>
          <input type="text" [(ngModel)]="legalName" name="legalName" placeholder="Nombre legal completo" required />
        </label>
        <label class="field">
          <span>Email</span>
          <input type="email" [(ngModel)]="email" name="email" placeholder="tu@correo.com" required />
          <small class="hint">Confirmed</small>
        </label>
        <label class="field">
          <span>Phone</span>
          <input type="tel" [(ngModel)]="phone" name="phone" placeholder="Tu teléfono" />
          <small class="hint">Solo para contacto y actualizaciones.</small>
        </label>
        <label class="field">
          <span>Location</span>
          <input type="text" [(ngModel)]="location" name="location" placeholder="Ciudad, estado, país" />
        </label>
        <button class="btn" type="submit">Guardar</button>
      </form>
    </section>

    <section class="step">
      <h2>Step 3: Experience & Preferences</h2>
      <form class="form" (ngSubmit)="saveStep3()" novalidate>
        <label class="field">
          <span>(Optional) How did you first hear about Cartesia?</span>
          <select [(ngModel)]="referral" name="referral">
            <option value="">Select an option</option>
            <option>Friend</option>
            <option>Social Media</option>
            <option>Search</option>
            <option>Other</option>
          </select>
        </label>
        <label class="field">
          <span>What topics are you passionate about teaching?</span>
          <input type="text" [(ngModel)]="topics" name="topics" placeholder="Select topics" />
        </label>
        <label class="field">
          <span>Which ages of learners do you want to work with?</span>
          <input type="text" [(ngModel)]="ages" name="ages" placeholder="Select age ranges" />
        </label>
        <label class="field">
          <span>What experience or expertise do you have in these subject areas?</span>
          <input type="text" [(ngModel)]="expertise" name="expertise" placeholder="Select experience types" />
        </label>
        <label class="field">
          <span>How many years of experience?</span>
          <select [(ngModel)]="years" name="years">
            <option value="">Select years of experience</option>
            <option>0-1</option>
            <option>2-3</option>
            <option>4-6</option>
            <option>7+</option>
          </select>
        </label>
        <label class="field">
          <span>Please describe your relevant teaching experience…</span>
          <textarea rows="5" [(ngModel)]="bio" name="bio" placeholder="Describe your relevant teaching experience..."></textarea>
        </label>
        <button class="btn" type="submit">Guardar</button>
      </form>
    </section>

    <section class="step">
      <h2>Step 4: Create Your Educator Profile Video</h2>
      <div class="panel">
        <button class="upload" type="button" (click)="uploadVideo()">Record or Upload Video</button>
        <div class="muted" *ngIf="uploading">Subiendo vídeo…</div>
        <div *ngIf="videoUrl">
          <video [src]="videoUrl" controls width="520"></video>
        </div>
        <ul class="muted">
          <li>Comprueba que tu vídeo sea ≤ 1GB.</li>
          <li>Revisa que la reproducción funcione correctamente.</li>
        </ul>
      </div>
      <p class="fineprint">*Figures represent average earnings for select cohorts…</p>
    </section>

    <section class="step">
      <h2>Step 5: Upload Your CV</h2>
      <div class="panel">
        <button class="upload" type="button" (click)="uploadCv()">Upload CV</button>
        <div class="muted" *ngIf="uploadingCv">Subiendo CV…</div>
        <div *ngIf="cvUrl">
          <a [href]="cvUrl" target="_blank">Ver CV</a>
        </div>
        <ul class="muted">
          <li>Formatos aceptados: PDF, DOC, DOCX.</li>
        </ul>
      </div>
    </section>

    <section class="step">
      <h2>Step 6: Submit Your Application</h2>
      <div class="panel">
        <label class="agree">
          <input type="checkbox" [(ngModel)]="agree" name="agree" />
          <span>I agree to the <a routerLink="/terminos">Terms of Service</a>, Class Content Policy, and Community Standards</span>
        </label>
        <button class="submit" [disabled]="!canSubmit() || submitting" (click)="submitApp()">Submit application</button>
        <div class="success" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="error" *ngIf="errorMsg">{{ errorMsg }}</div>
      </div>
    </section>
  `,
  styles: [`
    :host { display:block; }
    .topbar { position: sticky; top: 0; z-index: 100; display:flex; align-items:center; justify-content:space-between; padding: 12px 16px; background: rgba(255,255,255,.85); backdrop-filter: blur(8px); border-bottom:1px solid #e5e7eb; }
    .brand { font-weight:800; color:#111827; text-decoration:none; }
    .menu { list-style:none; display:flex; gap: 10px; margin:0; padding:0; flex-wrap: wrap; }
    .menu a { text-decoration:none; color:#111827; font-weight:600; padding: 8px 10px; border-radius:8px; }
    .menu a.active, .menu a:hover { background:#f3f4f6; }
    .step { max-width: 1000px; margin: 16px auto; padding: 0 16px; }
    h2 { margin: 8px 0 6px; font-weight:800; font-size: clamp(22px, 4.5vw, 30px); }
    .muted { color:#6b7280; }
    .panel { border:1px solid #e5e7eb; border-radius:12px; padding: 12px; background:#fff; }
    .panel.passion { background: #eef2ff; border-color: #c7d2fe; }
    .learn-grid { display:grid; grid-template-columns: minmax(260px, 1fr) minmax(260px, 1fr) minmax(280px, 1fr); gap: 12px; margin-top: 12px; }
    .card { display:block; border-radius:12px; padding: 12px; background:#fff; border:1px solid #e5e7eb; font-weight:700; color:#111827; text-decoration:none; }
    .card.yellow { background:#fde68a; border-color:#f59e0b; }
    .video { border-radius:12px; height: 220px; background:#6b7280; display:grid; place-items:center; }
    .play { width:56px; height:56px; border-radius:999px; border:0; background:#fff; color:#111827; font-size:20px; cursor:pointer; }
    .form { display:grid; gap: 12px; }
    .field { display:grid; gap:6px; }
    .field input, .field select, .field textarea { width:100%; padding:10px 12px; border-radius:10px; border:1px solid #e5e7eb; }
    .hint { color:#6b7280; }
    .btn { padding:10px 12px; border-radius:10px; border:1px solid #111827; background:#111827; color:#fff; font-weight:700; width: fit-content; }
    .upload { padding:10px 12px; border-radius:10px; border:1px solid #111827; background:#f472b6; color:#fff; font-weight:700; }
    .agree { display:flex; align-items:flex-start; gap:8px; margin-top: 12px; }
    .submit { margin-top: 12px; padding:10px 12px; border-radius:10px; border:0; background:#1f2937; color:#fff; font-weight:800; }
    .fineprint { color:#6b7280; font-size:.85rem; }
    .success { margin-top: 12px; border:1px solid #10b981; background:#d1fae5; color:#065f46; padding:10px 12px; border-radius:10px; font-weight:600; }
    .error { margin-top: 12px; border:1px solid #ef4444; background:#fee2e2; color:#991b1b; padding:10px 12px; border-radius:10px; font-weight:600; }
    @media (max-width: 960px) { .learn-grid { grid-template-columns: 1fr; } }
  `]
})
export class TutorApplyPage {
  publicName = '';
  legalName = '';
  email = '';
  phone = '';
  location = '';
  referral = '';
  topics = '';
  ages = '';
  expertise = '';
  years = '';
  bio = '';
  agree = false;
  uploading = false;
  videoUrl = '';
  uploadingCv = false;
  cvUrl = '';
  successMsg = '';
  errorMsg = '';
  submitting = false;

  constructor(private api: ApiService) {
    this.prefillFromProfile();
  }

  async prefillFromProfile() {
    try { const me = await this.api.me(); this.email = me.email || ''; this.publicName = me.username || ''; } catch {}
  }
  async saveStep2() {
    await this.api.saveTeacherApplication({ publicName: this.publicName, legalName: this.legalName, email: this.email, phone: this.phone, location: this.location });
    alert('Datos guardados');
  }
  async saveStep3() {
    await this.api.saveTeacherApplication({ referral: this.referral, topics: this.topics, ages: this.ages, expertise: this.expertise, years: this.years, bio: this.bio });
    alert('Preferencias guardadas');
  }
  async uploadVideo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 1024 * 1024 * 1024) { alert('El vídeo supera 1GB'); return; }
      this.uploading = true;
      try {
        const res = await this.api.uploadResourceFile(file, 'Teacher profile video');
        this.videoUrl = res.url;
        await this.api.saveTeacherVideo(res.url);
        alert('Video subido y vinculado');
      } catch (e) {
        alert('No se pudo subir el video');
      } finally {
        this.uploading = false;
      }
    };
    input.click();
  }
  canSubmit(): boolean { return !!(this.publicName && this.legalName && this.email && this.agree); }
  async submitApp() {
    if (!this.canSubmit()) return;
    this.errorMsg = '';
    this.successMsg = '';
    this.submitting = true;
    try {
      await this.api.saveTeacherApplication({ publicName: this.publicName, legalName: this.legalName, email: this.email, phone: this.phone, location: this.location, referral: this.referral, topics: this.topics, ages: this.ages, expertise: this.expertise, years: this.years, bio: this.bio });
      const res = await this.api.submitTeacherApplication(this.agree);
      if (res?.ok) {
        this.successMsg = 'Gracias por completar el formulario. Tu solicitud ha sido enviada satisfactoriamente. Dentro de unos días recibirás una respuesta en la bandeja de entrada de tu correo electrónico.';
      } else {
        this.errorMsg = 'No se pudo enviar la solicitud';
      }
    } catch {
      this.errorMsg = 'No se pudo enviar la solicitud';
    } finally {
      this.submitting = false;
    }
  }

  async uploadCv() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) { alert('El CV supera 20MB'); return; }
      this.uploadingCv = true;
      try {
        const res = await this.api.uploadResourceFile(file, 'Teacher CV');
        this.cvUrl = res.url;
        await this.api.saveTeacherCV(res.url);
        alert('CV subido y vinculado');
      } catch {
        alert('No se pudo subir el CV');
      } finally {
        this.uploadingCv = false;
      }
    };
    input.click();
  }
}
