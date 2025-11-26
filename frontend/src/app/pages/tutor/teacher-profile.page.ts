import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="topbar" aria-label="Navegación">
      <div class="brand" routerLink="/tutor/aprende">Cartesia</div>
      <ul class="menu">
        <li><a routerLink="/tutor/aprende/profesores">Profesores</a></li>
        <li><a routerLink="/tutor/aprende/materiales">Materiales</a></li>
        <li><a routerLink="/tutor/aprende/conviertete-en-profesor">Conviértete en profesor</a></li>
      </ul>
    </nav>

    <section class="profile">
      <div class="hero-video" *ngIf="videoUrl">
        <video [src]="videoUrl" controls width="100%"></video>
      </div>

      <header class="header">
        <div class="avatar">{{ displayInitial }}</div>
        <div class="info">
          <h1 class="name">{{ publicName || username || 'Profesor' }}</h1>
          <div class="subtitle">{{ subject }} • From {{ country }} {{ flag }}</div>
          <div class="status" [class.ok]="status==='submitted'" [class.draft]="status!=='submitted'">{{ status || 'draft' }}</div>
          <div class="highlight">
            <div class="pill">Perfect for business topics</div>
            <div class="desc">Highly rated by learners like you</div>
          </div>
          <div class="bullet"><span class="icon">☑</span><b>Professional Tutor</b><div class="muted">Qualified tutor with verified certificate.</div></div>
          <div class="bullet"><span class="icon">📚</span><b>Teaches</b><div class="muted">English lessons</div></div>
          <div class="contact" *ngIf="email || phone">
            <span *ngIf="email">{{ email }}</span>
            <span *ngIf="phone">• {{ phone }}</span>
          </div>
        </div>
      </header>

      <div class="grid">
        <section class="card">
          <h2>About me</h2>
          <p class="bio" *ngIf="bio; else bioEmpty">{{ bio }}</p>
          <ng-template #bioEmpty><p class="muted">Sin biografía</p></ng-template>
          <div class="langs">
            <div class="muted">I speak</div>
            <div class="lang-list">
              <span class="lang" *ngFor="let l of languages">{{l.name}} <span class="tag" [class.native]="l.level==='Native'">{{l.level}}</span></span>
            </div>
          </div>
          <div class="ratings">
            <div class="muted">Lesson rating</div>
            <div class="rating-grid">
              <div class="rating-card" *ngFor="let r of lessonRatings">
                <div class="score">{{r.score | number:'1.1-1'}}</div>
                <div class="label">{{r.label}}</div>
              </div>
            </div>
            <div class="muted small">Based on {{reviewsCount}} anonymous student reviews</div>
          </div>
        </section>

        <section class="card">
          <h2>What my students say</h2>
          <div class="avg"><span class="big">{{ratingAvg | number:'1.1-1'}}</span></div>
          <div class="muted small">Based on {{reviewsCount}} student reviews</div>
          <div class="reviews">
            <div class="review" *ngFor="let rv of reviews">
              <div class="avatar">{{ rv.initial }}</div>
              <div class="content">
                <div class="meta"><b>{{rv.name}}</b> • {{rv.date}}</div>
                <div class="stars">★★★★★</div>
                <div class="text">{{rv.text}}</div>
              </div>
            </div>
          </div>
          <button class="btn ghost">Show all {{reviewsCount}} reviews</button>
        </section>

        <section class="card">
          <h2>Resume</h2>
          <div class="muted">Certifications</div>
          <ul class="certs">
            <li *ngFor="let c of certifications">
              <div class="year">{{c.year}}</div>
              <div class="title">{{c.title}}</div>
              <div class="verified" *ngIf="c.verified">Certificate verified</div>
            </li>
          </ul>
          <div class="muted" *ngIf="cvUrl"><a [href]="cvUrl" target="_blank">View CV</a></div>
        </section>
      </div>

      <section class="card wide">
        <h2>My specialties</h2>
        <div class="specialties">
          <details *ngFor="let s of specialties">
            <summary>{{s}}</summary>
            <div class="muted">Details available upon request</div>
          </details>
        </div>
        <button class="btn ghost">Show more specialties</button>
      </section>
    </section>
  `,
  styles: [`
    :host { display:block; }
    .topbar { position: sticky; top: 0; z-index: 100; display:flex; align-items:center; justify-content:space-between; padding: 12px 16px; background: rgba(255,255,255,.85); backdrop-filter: blur(8px); border-bottom:1px solid #e5e7eb; }
    .brand { font-weight:800; color:#111827; text-decoration:none; }
    .menu { list-style:none; display:flex; gap: 10px; margin:0; padding:0; flex-wrap: wrap; }
    .menu a { text-decoration:none; color:#111827; font-weight:600; padding: 8px 10px; border-radius:8px; }
    .menu a:hover { background:#f3f4f6; }
    .profile { max-width: 1100px; margin: 16px auto; padding: 0 16px; }
    .hero-video { margin-bottom: 12px; border-radius:12px; overflow:hidden; background:#000; }
    .header { display:flex; align-items:center; gap: 14px; padding: 12px; border:1px solid #e5e7eb; border-radius:12px; background:#fff; }
    .avatar { width:64px; height:64px; border-radius:999px; background:#111827; color:#fff; display:grid; place-items:center; font-weight:800; font-size:22px; }
    .info .name { margin:0; font-weight:800; font-size: clamp(22px, 4vw, 32px); }
    .subtitle { color:#6b7280; }
    .status { display:inline-block; margin-top:6px; padding:4px 8px; border-radius:999px; font-weight:700; font-size:12px; }
    .status.ok { background:#d1fae5; color:#065f46; border:1px solid #10b981; }
    .status.draft { background:#fee2e2; color:#991b1b; border:1px solid #ef4444; }
    .contact { color:#6b7280; font-size:14px; }
    .highlight { margin-top:8px; border:1px solid #e5e7eb; border-radius:12px; padding:8px; background:#fff; }
    .pill { display:inline-block; font-weight:700; }
    .desc { color:#6b7280; }
    .bullet { margin-top:10px; }
    .bullet .icon { margin-right:6px; }
    .grid { display:grid; grid-template-columns: minmax(280px,1fr) minmax(280px,1fr) minmax(280px,1fr); gap: 12px; margin-top: 12px; }
    .card { border:1px solid #e5e7eb; border-radius:12px; padding: 12px; background:#fff; }
    .card.wide { margin-top: 12px; }
    .card h2 { margin:0 0 8px; font-size:18px; font-weight:800; }
    .bio { white-space: pre-wrap; }
    .muted { color:#6b7280; }
    .langs { margin-top:12px; }
    .lang-list { display:flex; gap:8px; flex-wrap:wrap; }
    .lang { display:inline-flex; gap:6px; align-items:center; }
    .tag { display:inline-block; padding:2px 6px; border-radius:999px; border:1px solid #e5e7eb; font-size:12px; }
    .tag.native { background:#d1fae5; border-color:#10b981; color:#065f46; }
    .ratings { margin-top:12px; }
    .rating-grid { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:8px; }
    .rating-card { border:1px solid #e5e7eb; border-radius:10px; padding:8px; text-align:center; }
    .rating-card .score { font-weight:800; font-size:18px; }
    .small { font-size:12px; }
    .avg .big { font-weight:800; font-size:26px; }
    .reviews { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; margin-top:10px; }
    .review { display:flex; gap:10px; border:1px solid #e5e7eb; border-radius:10px; padding:8px; }
    .review .avatar { width:32px; height:32px; border-radius:999px; background:#111827; color:#fff; display:grid; place-items:center; font-weight:800; }
    .review .stars { color:#f59e0b; }
    .certs { list-style:none; padding:0; margin:8px 0 0; display:grid; gap:6px; }
    .certs li { border-bottom:1px solid #e5e7eb; padding-bottom:6px; }
    .certs .year { color:#6b7280; font-size:12px; }
    .certs .verified { color:#065f46; font-size:12px; }
    .specialties details { border-bottom:1px solid #e5e7eb; padding:8px 0; }
    .btn.ghost { margin-top:10px; padding:8px 10px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; }
    @media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class TeacherProfilePage {
  username = '';
  publicName = '';
  email = '';
  phone = '';
  bio = '';
  videoUrl = '';
  cvUrl = '';
  status = 'draft';
  subject = 'English tutor';
  country = 'United States of America';
  flag = '🇺🇸';
  languages = [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Proficient C2' }
  ];
  lessonRatings = [
    { label: 'Reassurance', score: 5.0 },
    { label: 'Clarity', score: 4.9 },
    { label: 'Progress', score: 4.9 },
    { label: 'Preparation', score: 4.9 }
  ];
  ratingAvg = 4.9;
  reviewsCount = 82;
  reviews = [
    { initial: 'R', name: 'Ronilson', date: 'November 24, 2025', text: 'She is very friendly and attentive' },
    { initial: 'M', name: 'María', date: 'October 10, 2025', text: 'Great' },
    { initial: 'C', name: 'cristian', date: 'October 3, 2025', text: 'Excellent teacher! She is patient and very good at explaining.' },
    { initial: 'K', name: 'Krzysztof', date: 'October 2, 2025', text: 'Best English teacher. Very patient and her lessons make me happy.' },
    { initial: 'B', name: 'Barbara', date: 'September 22, 2025', text: 'Excellent teacher, very patient and dedicated.' },
    { initial: 'H', name: 'Hayani', date: 'September 12, 2025', text: 'She is nice, friendly, and patient. Clear explanations.' }
  ];
  certifications = [
    { year: '2025 — 2025', title: 'Preply Language Teaching Certificate', verified: true },
    { year: '2025 — 2025', title: 'Preply Language Teaching Certificate', verified: true }
  ];
  specialties = [
    'Conversational English',
    'Business English',
    'IELTS',
    'English for beginners',
    'American English',
    'Intensive English',
    'English for traveling',
    'ESL',
    'English as a subject',
    'For studying abroad'
  ];

  get displayInitial(): string {
    const n = this.publicName || this.username || 'P';
    return String(n).charAt(0).toUpperCase();
  }

  constructor(private api: ApiService) {
    this.load();
  }

  async load() {
    try {
      const me = await this.api.me();
      this.username = me?.username || '';
      const app: any = await this.api.getMyTeacherApplication();
      if (app && app.id) {
        this.publicName = app.publicName || '';
        this.email = app.email || me?.email || '';
        this.phone = app.phone || '';
        this.bio = app.bio || '';
        this.videoUrl = app.videoURL || app.videoUrl || '';
        this.cvUrl = app.cvURL || app.cvUrl || '';
        this.status = app.status || 'draft';
      } else {
        this.email = me?.email || '';
      }
    } catch {}
  }
}
