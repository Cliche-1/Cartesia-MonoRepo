import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tutor-learn',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="topbar" aria-label="Navegación">
      <div class="brand">Cartesia</div>
      <ul class="menu">
        <li><a routerLink="/tutor/aprende/profesores">Profesores</a></li>
        <li><a routerLink="/tutor/aprende/materiales">Materiales</a></li>
        <li><a routerLink="/tutor/aprende/conviertete-en-profesor">Conviértete en profesor</a></li>
        <li><a href="#app">Obtén la app</a></li>
      </ul>
    </nav>
    <section class="hero pink">
      <div class="left">
        <h1 class="headline">Aprende más rápido con tu mejor tutor</h1>
        <div class="cta-row">
          <a class="cta" routerLink="/tutor/aprende/profesores">Encuentra tu tutor</a>
        </div>
      </div>
      <div class="right">
        <div class="photo-stack">
          <div class="photo p1"></div>
          <div class="photo p2"></div>
          <div class="photo p3"></div>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="stat"><span class="num">100,000+</span><span class="label">Tutores con experiencia</span></div>
      <div class="stat"><span class="num">300,000+</span><span class="label">Reseñas 5★</span></div>
      <div class="stat"><span class="num">120+</span><span class="label">Materias</span></div>
      <div class="stat"><span class="num">180+</span><span class="label">Nacionalidades</span></div>
      <div class="stat"><span class="num">4.8★</span><span class="label">En la App Store</span></div>
    </section>

    <section class="goals">
      <header class="goals-header">
        <h2>Comienza con tus objetivos</h2>
        <p>Te recomendamos lecciones, temas y actividades para lograr tus metas.</p>
        <a class="btn primary" routerLink="/tutor/roadmap-chat">Empieza a aprender</a>
      </header>
      <div class="goals-grid">
        <article class="goal-card">
          <div class="label">Concéntrate en tus objetivos personales</div>
          <div class="art left"></div>
        </article>
        <article class="goal-card">
          <div class="label">Elige la forma en que aprendes</div>
          <div class="art right"></div>
        </article>
      </div>
    </section>

    <section class="catalog" id="catalog">
      <div class="grid">
        <a class="card" routerLink="/buscar"><div class="icon">🇬🇧</div><div class="text"><div class="title">English tutors</div><div class="meta">2,314 tutors</div></div><div class="arrow">›</div></a>
        <a class="card" routerLink="/buscar"><div class="icon">🇪🇸</div><div class="text"><div class="title">Spanish tutors</div><div class="meta">1,872 tutors</div></div><div class="arrow">›</div></a>
        <a class="card" routerLink="/buscar"><div class="icon">🇫🇷</div><div class="text"><div class="title">French tutors</div><div class="meta">1,265 tutors</div></div><div class="arrow">›</div></a>
        <a class="card" routerLink="/buscar"><div class="icon">🇩🇪</div><div class="text"><div class="title">German tutors</div><div class="meta">1,104 tutors</div></div><div class="arrow">›</div></a>
        <a class="card" routerLink="/buscar"><div class="icon">🇮🇹</div><div class="text"><div class="title">Italian tutors</div><div class="meta">943 tutors</div></div><div class="arrow">›</div></a>
        <a class="card" routerLink="/buscar"><div class="icon">🇨🇳</div><div class="text"><div class="title">Chinese tutors</div><div class="meta">1,502 tutors</div></div><div class="arrow">›</div></a>
        <a class="card" routerLink="/buscar"><div class="icon">🇸🇦</div><div class="text"><div class="title">Arabic tutors</div><div class="meta">712 tutors</div></div><div class="arrow">›</div></a>
        <a class="card" routerLink="/buscar"><div class="icon">🇯🇵</div><div class="text"><div class="title">Japanese tutors</div><div class="meta">1,083 tutors</div></div><div class="arrow">›</div></a>
        <a class="card" routerLink="/buscar"><div class="icon">🇵🇹</div><div class="text"><div class="title">Portuguese tutors</div><div class="meta">1,085 tutors</div></div><div class="arrow">›</div></a>
        <a class="more" routerLink="/buscar">Mostrar más</a>
      </div>
    </section>

    <section class="progress">
      <header class="progress-header">
        <h2>El progreso empieza con el tutor correcto</h2>
        <p>Millones de estudiantes, miles de tutores. Avances personales y medibles.</p>
      </header>
      <div class="progress-hero">
        <div class="photo-stack">
          <div class="photo q1"></div>
          <div class="photo q2"></div>
          <div class="photo q3"></div>
        </div>
        <blockquote class="quote">“Con Cartesia, gané confianza y me di cuenta de que sí puedo.”</blockquote>
      </div>
    </section>

    <section class="how" id="how">
      <h3>Cómo funciona</h3>
      <div class="steps">
        <article class="step">
          <div class="num">1</div>
          <div class="title">Encuentra tu tutor</div>
          <p>Filtra por idioma, especialidad, nivel y horarios.</p>
        </article>
        <article class="step">
          <div class="num">2</div>
          <div class="title">Empieza a aprender</div>
          <p>Agenda tu primera clase y recibe un plan personalizado.</p>
        </article>
        <article class="step">
          <div class="num">3</div>
          <div class="title">Avanza cada semana</div>
          <p>Seguimiento, tareas y recomendaciones para progresar.</p>
        </article>
      </div>
    </section>

    <section class="app-promo" id="app">
      <div class="promo-wrap">
        <div class="promo-text">
          <h2>Cartesia en donde sea</h2>
          <p>Toma lecciones desde cualquier lugar y continúa tu aprendizaje con nuestra aplicación.</p>
          <div class="badges">
            <a class="store badge ios" href="#" aria-label="App Store">App Store</a>
            <a class="store badge gp" href="#" aria-label="Google Play">Google Play</a>
          </div>
        </div>
        <div class="promo-phone">
          <div class="phone">
            <div class="screen"></div>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer-dark">
      <div class="cols">
        <div class="col">
          <div class="title">Sobre</div>
          <a href="#">Centro de ayuda</a>
          <a href="#">Carreras</a>
          <a href="#">Noticias</a>
        </div>
        <div class="col">
          <div class="title">Unirse</div>
          <a href="#">Cartesia Pro</a>
          <a href="#">Para negocios</a>
          <a href="#">Convertirse en tutor</a>
        </div>
        <div class="col">
          <div class="title">Otro</div>
          <a href="#">Política de Privacidad</a>
          <a href="#">Términos y Condiciones</a>
        </div>
        <div class="col">
          <div class="title">Redes sociales</div>
          <div class="socials">
            <a href="#">IG</a>
            <a href="#">FB</a>
            <a href="#">X</a>
          </div>
          <div class="badges small">
            <a class="store badge ios" href="#" aria-label="App Store">App Store</a>
            <a class="store badge gp" href="#" aria-label="Google Play">Google Play</a>
          </div>
        </div>
      </div>
      <div class="brand-row">
        <div class="logo">Cartesia</div>
        <div class="copy">© Cartesia {{ year }}. Todos los derechos reservados.</div>
      </div>
    </footer>
  `,
  styles: [`
    .topbar { position: sticky; top: 0; z-index: 100; display:flex; align-items:center; justify-content:space-between; padding: 12px 16px; background: rgba(255,255,255,.85); backdrop-filter: blur(8px); border-bottom:1px solid #e5e7eb; }
    .topbar .brand { font-weight:800; letter-spacing:.02em; color:#111827; }
    .menu { list-style:none; display:flex; gap: 10px; margin:0; padding:0; flex-wrap: wrap; }
    .menu a { text-decoration:none; color:#111827; font-weight:600; padding: 8px 10px; border-radius:8px; }
    .menu a:hover { background:#f3f4f6; }
    :host { display:block; overflow-x: hidden; }
    .hero.pink { background: #f472b6; color:#1f2937; display:grid; grid-template-columns: minmax(280px,1fr) minmax(280px,1fr); align-items:center; padding: clamp(16px,3vw,24px); }
    .left { padding: clamp(12px,2.5vw,24px); }
    .headline { margin:0 0 14px; font-weight:800; letter-spacing:-.02em; font-size: clamp(28px, 6vw, 56px); line-height: 1.05; color:#111827; }
    .cta-row { display:flex; gap:10px; }
    .cta { display:inline-block; padding:12px 16px; border-radius:999px; border:1.5px solid rgba(17,24,39,.8); color:#111827; text-decoration:none; font-weight:700; background: transparent; }
    .cta:hover { background: rgba(17,24,39,.08); }
    .right { display:grid; place-items:center; padding: clamp(12px,2.5vw,24px); }
    .photo-stack { position:relative; width: clamp(260px, 40vw, 420px); height: clamp(180px, 26vw, 280px); }
    .photo { position:absolute; width: 76%; height: 74%; border-radius: 16px; background: linear-gradient(135deg, #fde68a, #f59e0b); box-shadow: 0 20px 40px rgba(0,0,0,.25); }
    .photo.p1 { left: 6%; top: 8%; transform: rotate(-6deg); }
    .photo.p2 { left: 22%; top: 18%; transform: rotate(2deg); background: linear-gradient(135deg, #bfdbfe, #60a5fa); }
    .photo.p3 { left: 38%; top: 28%; transform: rotate(8deg); background: linear-gradient(135deg, #fecaca, #f472b6); }
    .stats { display:grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 16px; padding: clamp(16px,3vw,24px); background: #fff; color:#111827; }
    .stat { text-align:center; }
    .num { display:block; font-weight:800; font-size: 22px; }
    .label { display:block; color:#6b7280; font-size: 13px; }
    .catalog { padding: clamp(16px,3vw,24px); background: #fff; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
    .card { display:flex; align-items:center; justify-content:space-between; gap:10px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 12px; background:#fff; text-decoration:none; color:#111827; }
    .card .icon { font-size: 18px; }
    .card .text { flex:1; }
    .card .title { font-weight:600; }
    .card .meta { font-size:12px; color:#6b7280; }
    .card .arrow { font-weight:700; color:#6b7280; }
    .more { display:inline-block; padding:8px 10px; color:#6b7280; text-decoration:none; }
    .goals { background: linear-gradient(180deg,#fff, #f3f4f6); color:#111827; padding: clamp(16px,3vw,24px); }
    .goals-header { text-align:center; max-width: 760px; margin: 0 auto 16px; }
    .goals-header h2 { margin:0 0 6px; font-weight:700; font-size: 26px; }
    .goals-header p { margin:0 0 10px; color:#6b7280; }
    .btn.primary { display:inline-block; padding:10px 16px; border-radius:999px; border:1px solid #111827; background:#111827; color:#fff; text-decoration:none; font-weight:700; }
    .goals-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }
    .goal-card { background:#fff; border:1px solid #e5e7eb; border-radius: 16px; overflow:hidden; }
    .goal-card .label { padding: 10px 12px; font-weight:600; color:#374151; border-bottom:1px solid #e5e7eb; }
    .goal-card .art { height: 220px; }
    .goal-card .art.left { background: linear-gradient(135deg,#fde68a,#f59e0b); }
    .goal-card .art.right { background: linear-gradient(135deg,#bfdbfe,#60a5fa); }
    .progress { background:#fff; color:#111827; padding: clamp(16px,3vw,24px); }
    .progress-header { text-align:center; max-width: 800px; margin: 0 auto 12px; }
    .progress-header h2 { margin:0 0 6px; font-weight:800; font-size: 28px; }
    .progress-header p { margin:0; color:#6b7280; }
    .progress-hero { display:grid; grid-template-columns: minmax(280px,1fr) minmax(280px,1fr); align-items:center; gap: 16px; max-width: 1200px; margin: 0 auto; }
    .progress-hero .photo-stack { position:relative; width: 420px; height: 280px; }
    .progress-hero .photo { position:absolute; width: 320px; height: 220px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,.25); }
    .progress-hero .photo.q1 { left: 20px; top: 20px; transform: rotate(-6deg); background: linear-gradient(135deg,#fecaca,#f472b6); }
    .progress-hero .photo.q2 { left: 80px; top: 40px; transform: rotate(2deg); background: linear-gradient(135deg,#bfdbfe,#60a5fa); }
    .progress-hero .photo.q3 { left: 140px; top: 60px; transform: rotate(8deg); background: linear-gradient(135deg,#fde68a,#f59e0b); }
    .quote { font-size: 18px; color:#111827; }
    .how { background:#fff; color:#111827; padding: clamp(16px,3vw,24px); max-width: 1200px; margin: 0 auto; }
    .how h3 { margin:0 0 12px; font-weight:800; font-size: 22px; }
    .steps { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
    .step { border:1px solid #111827; border-radius: 14px; padding: 14px; background:#fff; }
    .step .num { font-weight:800; color:#fff; background:#111827; display:inline-block; width: 24px; height:24px; border-radius:6px; text-align:center; line-height:24px; margin-bottom: 8px; }
    .step .title { font-weight:700; margin-bottom: 6px; }
    .step p { margin:0; color:#6b7280; }
    .app-promo { background: linear-gradient(180deg,#fff,#e5e7eb); padding: clamp(16px,3vw,24px); }
    .promo-wrap { max-width: 1200px; margin:0 auto; display:grid; grid-template-columns: minmax(280px,1fr) minmax(280px,1fr); gap: 16px; align-items:center; }
    .promo-text h2 { margin:0 0 6px; font-weight:800; font-size: 26px; }
    .promo-text p { margin:0 0 12px; color:#374151; }
    .badges { display:flex; gap:10px; }
    .badge { display:inline-block; padding:10px 14px; border-radius:10px; border:1px solid #111827; color:#111827; background:#fff; text-decoration:none; font-weight:700; }
    .badge.ios { background: linear-gradient(135deg,#fff,#f3f4f6); }
    .badge.gp { background: linear-gradient(135deg,#fff,#eef2ff); }
    .promo-phone { display:grid; place-items:center; }
    .phone { width: clamp(180px, 20vw, 220px); height: clamp(320px, 38vw, 420px); border-radius: 28px; background:#111827; box-shadow: 0 28px 60px rgba(0,0,0,.35); padding: 12px; }
    .screen { width:100%; height:100%; border-radius: 16px; background: linear-gradient(135deg,#fde68a,#f59e0b); }
    .footer-dark { background:#0b1220; color:#e5e7eb; padding: clamp(16px,3vw,24px); }
    .footer-dark .cols { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; max-width: 1200px; margin: 0 auto; }
    .footer-dark .col .title { font-weight:700; margin-bottom: 8px; }
    .footer-dark .col a { display:block; color:#cbd5e1; text-decoration:none; margin: 4px 0; }
    .footer-dark .socials { display:flex; gap:8px; }
    .footer-dark .badges.small .badge { padding:8px 10px; border-color:#e5e7eb; color:#e5e7eb; background: transparent; }
    .brand-row { max-width: 1100px; margin: 16px auto 0; display:flex; align-items:center; justify-content:space-between; }
    .brand-row .logo { font-weight:800; }
    .brand-row .copy { color:#94a3b8; font-size: 13px; }
    @media (max-width: 960px) { .hero.pink { grid-template-columns: 1fr; } }
  `]
})
export class TutorLearnAIPage { year = new Date().getFullYear(); }
