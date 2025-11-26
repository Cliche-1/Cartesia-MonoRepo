import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutor-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <nav class="topbar" aria-label="Navegación">
      <div class="brand" (click)="router.navigateByUrl('/tutor/aprende')" role="button">Cartesia</div>
      <ul class="menu">
        <li><a routerLink="/tutor/aprende/profesores" class="active">Profesores</a></li>
        <li><a routerLink="/tutor/aprende/materiales">Materiales</a></li>
        <li><a routerLink="/tutor/aprende/conviertete-en-profesor">Conviértete en profesor</a></li>
        <li><a routerLink="/tutor/aprende#app">Obtén la app</a></li>
      </ul>
    </nav>

    <section class="teachers">
      <div class="wrap">
        <div class="list">
          <div class="card" *ngFor="let t of tutors">
            <div class="photo"></div>
            <div class="info">
              <div class="name">{{t.name}}</div>
              <div class="rate">{{t.rating}} ★ · {{t.reviews}} reviews</div>
              <div class="tag">{{t.tag}}</div>
            </div>
            <button class="btn">Ver perfil</button>
          </div>
        </div>
        <div class="hero">
          <div class="logo">Cartesia</div>
          <h1 class="title">Tutores en línea para clases privadas</h1>
          <p class="desc">Encuentra el tutor ideal respondiendo algunas preguntas rápidas.</p>
          <label class="field"><span>Idioma</span>
            <select [(ngModel)]="subject">
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </label>
          <button class="cta" (click)="findTutor()">Find your tutor</button>
          <a class="link" (click)="showAll()">Show {{ total }} tutors</a>
        </div>
      </div>
    </section>
    <section class="filters">
      <div class="filters-wrap">
        <label class="field">
          <span>I want to learn</span>
          <select [(ngModel)]="fSubject">
            <option *ngFor="let s of subjects" [value]="s">{{s}}</option>
          </select>
        </label>
        <label class="field">
          <span>Price per lesson</span>
          <select [(ngModel)]="priceRange">
            <option value="PEN 10-140+">PEN 10-140+</option>
            <option value="PEN 24-60">PEN 24-60</option>
            <option value="PEN 60-140">PEN 60-140</option>
          </select>
        </label>
        <label class="field">
          <span>Country of birth</span>
          <select [(ngModel)]="country">
            <option value="Any country">Any country</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Peru">Peru</option>
          </select>
        </label>
        <label class="field">
          <span>I'm available</span>
          <select [(ngModel)]="availability">
            <option value="Any time">Any time</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </label>
        <label class="field grow">
          <span>Search</span>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Name or keyword" />
        </label>
        <label class="field">
          <span>Sort</span>
          <select [(ngModel)]="sortBy">
            <option value="top">Our top picks</option>
            <option value="rating">Highest rating</option>
            <option value="price">Lowest price</option>
          </select>
        </label>
      </div>
    </section>

    <section class="results">
      <div class="promo">
        <div class="box">Enjoy 30% off your trial lesson</div>
      </div>
      <div class="result-card" *ngFor="let r of results">
        <div class="left">
          <div class="photo"></div>
          <div class="details">
            <div class="name">{{r.name}}</div>
            <div class="badges">
              <span class="badge">Professional</span>
              <span class="badge">Super Tutor</span>
            </div>
            <div class="bio">{{r.bio}}</div>
            <div class="langs">{{r.langs}}</div>
            <div class="pop">{{r.pop}}</div>
          </div>
        </div>
        <div class="center">
          <div class="price">{{r.price}} <span class="old">{{r.oldPrice}}</span> <span class="dur">50-min lesson</span></div>
          <div class="stars">{{r.rating}} ★ · {{r.reviews}} reviews · {{r.students}} students</div>
          <div class="actions">
            <button class="btn primary">Book trial lesson</button>
            <button class="btn ghost">Message {{r.firstName}}</button>
          </div>
        </div>
        <div class="right">
          <div class="video"></div>
          <div class="links">
            <a class="link">View full schedule</a>
            <a class="link">See {{r.firstName}}'s profile</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .topbar { position: sticky; top: 0; z-index: 100; display:flex; align-items:center; justify-content:space-between; padding: 12px 16px; background: rgba(255,255,255,.85); backdrop-filter: blur(8px); border-bottom:1px solid #e5e7eb; }
    .brand { font-weight:800; letter-spacing:.02em; color:#111827; cursor:pointer; }
    .menu { list-style:none; display:flex; gap: 10px; margin:0; padding:0; flex-wrap: wrap; }
    .menu a { text-decoration:none; color:#111827; font-weight:600; padding: 8px 10px; border-radius:8px; }
    .menu a.active, .menu a:hover { background:#f3f4f6; }
    .teachers { background:#fff; color:#111827; padding: 16px; }
    .wrap { max-width: 1200px; margin:0 auto; display:grid; grid-template-columns: minmax(280px, 1fr) minmax(320px, 1fr); gap: 18px; }
    .list { display:grid; gap: 10px; }
    .card { display:flex; align-items:center; gap: 10px; border:1px solid #e5e7eb; border-radius: 12px; padding: 10px; background:#fff; }
    .photo { width: 64px; height:64px; border-radius: 12px; background: linear-gradient(135deg,#bfdbfe,#60a5fa); }
    .info { flex:1; }
    .name { font-weight:700; }
    .rate { font-size:12px; color:#6b7280; }
    .tag { font-size:12px; color:#374151; }
    .btn { padding:8px 10px; border-radius:10px; border:1px solid #111827; background:#111827; color:#fff; cursor:pointer; }
    .hero { padding: 12px 16px; border:1px solid #e5e7eb; border-radius: 12px; background:#fff; }
    .logo { font-weight:800; margin-bottom: 6px; }
    .title { margin:0 0 8px; font-weight:800; font-size: clamp(22px, 4vw, 34px); }
    .desc { margin:0 0 12px; color:#374151; }
    .field { display:grid; gap:6px; margin: 8px 0; }
    select { width:100%; padding:10px 12px; border-radius:10px; border:1px solid #e5e7eb; }
    .cta { width:100%; margin-top: 10px; padding:12px 14px; border-radius:999px; border:0; background:#f472b6; color:#fff; font-weight:800; cursor:pointer; }
    .link { display:inline-block; margin-top: 8px; color:#6b7280; text-decoration:underline; cursor:pointer; }
    .filters { background:#fff; color:#111827; padding: 12px 16px; border-top:1px solid #e5e7eb; }
    .filters-wrap { max-width: 1200px; margin:0 auto; display:flex; flex-wrap:wrap; gap: 10px; }
    .grow { flex:1 1 320px; }
    input[type=text] { width:100%; padding:10px 12px; border-radius:10px; border:1px solid #e5e7eb; }
    .results { background:#fff; color:#111827; padding: 16px; }
    .promo .box { max-width: 1200px; margin:0 auto 12px; background:#eef2ff; color:#1f2937; border:1px solid #c7d2fe; border-radius:12px; padding: 12px; }
    .result-card { max-width: 1200px; margin:0 auto 12px; border:1px solid #e5e7eb; border-radius:12px; background:#fff; display:grid; grid-template-columns: minmax(220px, 1fr) minmax(280px, 1fr) minmax(220px, 1fr); gap: 10px; padding: 10px; }
    .result-card .left { display:flex; gap: 10px; }
    .result-card .photo { width:72px; height:72px; border-radius:12px; background: linear-gradient(135deg,#fecaca,#f472b6); }
    .badges { display:flex; gap:6px; }
    .badge { font-size:12px; padding:4px 6px; border-radius:6px; background:#f3f4f6; border:1px solid #e5e7eb; }
    .price { font-weight:800; }
    .price .old { text-decoration: line-through; color:#6b7280; margin-left: 6px; }
    .price .dur { color:#6b7280; margin-left: 6px; font-weight:400; }
    .stars { font-size:12px; color:#374151; margin:6px 0; }
    .actions { display:flex; gap:8px; }
    .btn.primary { padding:8px 10px; border-radius:10px; border:0; background:#f472b6; color:#fff; font-weight:700; }
    .btn.ghost { padding:8px 10px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; color:#111827; }
    .right .video { width:100%; height:120px; border-radius:12px; background: linear-gradient(135deg,#fde68a,#f59e0b); }
    .right .links { display:grid; gap:6px; margin-top: 6px; }
    .right .link { color:#6b7280; text-decoration:underline; cursor:pointer; }
    @media (max-width: 900px) { .result-card { grid-template-columns: 1fr; } }
    @media (max-width: 900px) { .wrap { grid-template-columns: 1fr; } }
  `]
})
export class TutorTeachersPage {
  subject = 'English';
  total = 36929;
  tutors = [
    { name: 'Robert F.', rating: 4.8, reviews: 34, tag: 'For beginners' },
    { name: 'Jane M.', rating: 4.9, reviews: 67, tag: 'Native Speaker' },
    { name: 'Claire S.', rating: 5.0, reviews: 43, tag: 'Business French' },
  ];
  subjects = ['English','Spanish','French'];
  fSubject = 'English';
  priceRange = 'PEN 10-140+';
  country = 'Any country';
  availability = 'Any time';
  sortBy = 'top';
  searchQuery = '';
  results = [
    { firstName: 'Denis', name: 'Denis M.', price: 'PEN 83', oldPrice: 'PEN 119', rating: 4.9, reviews: 55, students: 3042, bio: 'Master IELTS, TOEFL, DET, CAE & CELPIP | Business English & Confidence Coach', langs: 'Speaks Serbian (Native), English (Native) +1', pop: 'Super popular. Booked 20+ times recently' },
    { firstName: 'Robert', name: 'Robert F.', price: 'PEN 75', oldPrice: 'PEN 105', rating: 4.8, reviews: 34, students: 1250, bio: 'Business English, interview prep and career coaching', langs: 'Speaks English (Native)', pop: 'Popular. Booked 10+ times recently' },
    { firstName: 'Jane', name: 'Jane M.', price: 'PEN 92', oldPrice: 'PEN 130', rating: 4.9, reviews: 67, students: 2100, bio: 'Native speaker focused on pronunciation and confidence', langs: 'Speaks English (Native), Spanish (B2)', pop: 'High demand among intermediate learners' },
    { firstName: 'Claire', name: 'Claire S.', price: 'PEN 88', oldPrice: 'PEN 120', rating: 5.0, reviews: 43, students: 980, bio: 'Business French and exam preparation (DELF/DALF)', langs: 'Speaks French (Native), English (C1)', pop: 'Top rated. Excellent reviews' },
    { firstName: 'Tiago', name: 'Tiago C.', price: 'PEN 70', oldPrice: 'PEN 99', rating: 4.7, reviews: 44, students: 800, bio: 'Conversation and pronunciation for daily use', langs: 'Speaks Portuguese (Native), English (C1)', pop: 'Great for beginners starting now' }
  ];
  constructor(public router: Router) {}
  findTutor() { this.router.navigate(['/buscar'], { queryParams: { subject: this.subject } }); }
  showAll() { this.router.navigate(['/buscar'], { queryParams: { allTutors: true } }); }
}
