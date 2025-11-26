import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tutor-become',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="topbar" aria-label="Navegación">
      <div class="brand" routerLink="/tutor/aprende">Cartesia</div>
      <ul class="menu">
        <li><a routerLink="/tutor/aprende/profesores">Profesores</a></li>
        <li><a routerLink="/tutor/aprende/materiales">Materiales</a></li>
        <li><a routerLink="/tutor/aprende/conviertete-en-profesor" class="active">Conviértete en profesor</a></li>
        <li><a routerLink="/tutor/aprende#app">Obtén la app</a></li>
      </ul>
    </nav>

    <section class="become-hero">
      <div class="wrap">
        <div class="left">
          <h1 class="title">Gánate la vida enseñando a la mayor comunidad de estudiantes del mundo</h1>
          <div class="steps">
            <div class="step"><div class="num">1</div><div class="txt"><div class="headline">Regístrate</div><div class="desc">para crear tu perfil de profesor</div></div></div>
            <div class="step"><div class="num">2</div><div class="txt"><div class="headline">Consigue la aprobación</div><div class="desc">por nuestro equipo en 5 días laborales</div></div></div>
            <div class="step"><div class="num">3</div><div class="txt"><div class="headline">Comienza a ganar</div><div class="desc">enseñando a estudiantes de todo el mundo</div></div></div>
          </div>
          <a class="cta" routerLink="/tutor/aprende/profesor/aplicar">Crear perfil de profesor</a>
        </div>
        <div class="right">
          <div class="photo-stack">
            <div class="photo p1"></div>
            <div class="photo p2"></div>
            <div class="photo p3"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="benefits">
      <div class="grid">
        <article class="benefit"><h3>Establece tu propia tarifa</h3><p>Elige tu tarifa por hora y cámbiala en cualquier momento.</p></article>
        <article class="benefit"><h3>Enseña en cualquier momento y lugar</h3><p>Decide cuándo y cuántas horas quieres enseñar. Sin horarios fijos.</p></article>
        <article class="benefit"><h3>Crece profesionalmente</h3><p>Una vez homologado, podrás empezar a enseñar en tan solo tres días.</p></article>
      </div>
    </section>

    <section class="testimonial">
      <div class="wrap">
        <div class="left">
          <div class="photo-stack">
            <div class="photo p1"></div>
            <div class="photo p2"></div>
            <div class="photo p3"></div>
          </div>
        </div>
        <div class="right">
          <h2>“Cartesia me permite ganarme la vida sin tener que salir de casa!”</h2>
          <p class="meta">Krista A. · Enseña inglés</p>
          <a class="cta" routerLink="/tutor/aprende/profesor/aplicar">Crear perfil de profesor</a>
        </div>
      </div>
    </section>

    <section class="faq">
      <div class="wrap">
        <h3>Preguntas frecuentes</h3>
        <details>
          <summary>¿Qué tipo de profesores busca Cartesia?</summary>
          <p>Profesores con vocación, buena comunicación y disposición para enseñar de forma remota.</p>
        </details>
        <details>
          <summary>¿Qué materia puedo enseñar?</summary>
          <p>Puedes enseñar idiomas, preparación de exámenes, y habilidades profesionales según tu experiencia.</p>
        </details>
        <details>
          <summary>¿Cómo puedo convertirme en profesor?</summary>
          <p>Regístrate, completa tu perfil y envía tu solicitud para aprobación.</p>
        </details>
        <details>
          <summary>¿Cómo lograr que mi perfil sea aprobado rápidamente?</summary>
          <p>Completa toda tu información, añade vídeo de presentación y certificaciones relevantes.</p>
        </details>
        <details>
          <summary>¿Por qué debería enseñar en Cartesia?</summary>
          <p>Acceso a estudiantes globales, horarios flexibles y herramientas de clase integradas.</p>
        </details>
        <details>
          <summary>¿Qué equipo informático necesito para enseñar?</summary>
          <p>PC o laptop, buena conexión a Internet, micrófono y cámara web.</p>
        </details>
        <details>
          <summary>¿Es gratis crear un perfil?</summary>
          <p>Sí, crear tu perfil es gratuito.</p>
        </details>
        <details>
          <summary>¿Cuánto puedo ganar?</summary>
          <p>Depende de tu tarifa y horas. Tú eliges tu precio por hora.</p>
        </details>
      </div>
    </section>
  `,
  styles: [`
    .topbar { position: sticky; top: 0; z-index: 100; display:flex; align-items:center; justify-content:space-between; padding: 12px 16px; background: rgba(255,255,255,.85); backdrop-filter: blur(8px); border-bottom:1px solid #e5e7eb; }
    .brand { font-weight:800; color:#111827; text-decoration:none; }
    .menu { list-style:none; display:flex; gap: 10px; margin:0; padding:0; flex-wrap: wrap; }
    .menu a { text-decoration:none; color:#111827; font-weight:600; padding: 8px 10px; border-radius:8px; }
    .menu a.active, .menu a:hover { background:#f3f4f6; }
    .become-hero .wrap { max-width: 1200px; margin:0 auto; display:grid; grid-template-columns: minmax(320px,1fr) minmax(320px,1fr); gap: 18px; padding: 16px; }
    .title { margin:0 0 12px; font-weight:800; font-size: clamp(26px, 5vw, 40px); }
    .steps { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; margin: 10px 0 16px; }
    .step { display:flex; gap: 10px; align-items:flex-start; }
    .num { width: 28px; height:28px; border-radius:6px; background:#111827; color:#fff; font-weight:800; text-align:center; line-height:28px; }
    .headline { font-weight:700; }
    .desc { color:#6b7280; font-size: 13px; }
    .cta { display:inline-block; padding:12px 14px; border-radius:999px; background:#10b981; color:#fff; text-decoration:none; font-weight:800; }
    .photo-stack { position:relative; width: clamp(280px, 40vw, 440px); height: clamp(200px, 28vw, 320px); }
    .photo { position:absolute; width: 76%; height: 74%; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,.25); }
    .photo.p1 { left: 6%; top: 8%; transform: rotate(-6deg); background: linear-gradient(135deg,#fecaca,#f472b6); }
    .photo.p2 { left: 22%; top: 18%; transform: rotate(2deg); background: linear-gradient(135deg,#bfdbfe,#60a5fa); }
    .photo.p3 { left: 38%; top: 28%; transform: rotate(8deg); background: linear-gradient(135deg,#fde68a,#f59e0b); }
    .benefits { background:#fff; color:#111827; padding: 16px; }
    .grid { max-width: 1200px; margin:0 auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
    .benefit { border:1px solid #e5e7eb; border-radius:12px; background:#fff; padding: 12px; }
    .testimonial .wrap { max-width: 1200px; margin:0 auto; display:grid; grid-template-columns: minmax(320px,1fr) minmax(320px,1fr); gap: 18px; padding:16px; }
    .testimonial h2 { margin:0 0 12px; font-weight:800; font-size: clamp(22px, 4.5vw, 34px); }
    .testimonial .meta { margin:0 0 12px; color:#374151; }
    .faq .wrap { max-width: 900px; margin:0 auto; padding: 16px; }
    .faq h3 { margin:0 0 12px; font-weight:800; font-size: 22px; }
    details { border-bottom:1px solid #e5e7eb; padding: 8px 0; }
    summary { cursor:pointer; font-weight:600; }
    @media (max-width: 960px) { .become-hero .wrap, .testimonial .wrap { grid-template-columns: 1fr; } }
  `]
})
export class TutorBecomePage {}
