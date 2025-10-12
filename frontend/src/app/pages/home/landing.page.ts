import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing">
      <!-- Fondo grafo de red -->
      <div class="network-bg" aria-hidden="true">
        <canvas #canvas class="canvas"></canvas>
      </div>

      <!-- Gradientes suaves detrás -->
      <div class="bg-gradient"></div>
      <div class="blob"></div>

      <main class="hero">
        <div class="pill">Explora roadmaps creados por la comunidad</div>
        <h1>
          Descubre, crea y comparte<br />
          roadmaps profesionales
        </h1>
        <p class="subtitle">
          Sigue a creadores, encuentra rutas de aprendizaje y publica las tuyas.
        </p>
        <div class="cta">
          <a class="btn primary" routerLink="/register">Empezar</a>
          <a class="btn ghost" routerLink="/roadmaps">Explorar Roadmaps</a>
        </div>
        <div class="search">
          <input type="text" placeholder="Buscar roadmaps, temas o creadores" />
          <div class="hint">Ejemplo: Frontend, Data Science, DevOps, UX/UI</div>
        </div>
      </main>

      <!-- Destacados -->
      <section class="featured-grid">
        <article class="card fade">
          <h3>Frontend moderno</h3>
          <p>De HTML/CSS a frameworks y accesibilidad.</p>
          <div class="meta"><span>Nivel: Intermedio</span><span>Tiempo: 8-12 semanas</span></div>
          <a class="link" routerLink="/roadmaps">Ver roadmap</a>
        </article>
        <article class="card fade" style="animation-delay: .06s">
          <h3>Backend con Go</h3>
          <p>APIs, pruebas, despliegue y observabilidad.</p>
          <div class="meta"><span>Nivel: Intermedio</span><span>Tiempo: 10-14 semanas</span></div>
          <a class="link" routerLink="/roadmaps">Ver roadmap</a>
        </article>
        <article class="card fade" style="animation-delay: .12s">
          <h3>Data Science</h3>
          <p>Python, análisis, ML clásico y visualización.</p>
          <div class="meta"><span>Nivel: Avanzado</span><span>Tiempo: 12-16 semanas</span></div>
          <a class="link" routerLink="/roadmaps">Ver roadmap</a>
        </article>
        <article class="card fade" style="animation-delay: .18s">
          <h3>DevOps esencial</h3>
          <p>CI/CD, contenedores y prácticas SRE.</p>
          <div class="meta"><span>Nivel: Intermedio</span><span>Tiempo: 8-10 semanas</span></div>
          <a class="link" routerLink="/roadmaps">Ver roadmap</a>
        </article>
      </section>

      <!-- Chips de categorías -->
      <section class="chip-row">
        <a class="chip" routerLink="/roadmaps">Frontend</a>
        <a class="chip" routerLink="/roadmaps">Backend</a>
        <a class="chip" routerLink="/roadmaps">Data</a>
        <a class="chip" routerLink="/roadmaps">DevOps</a>
        <a class="chip" routerLink="/roadmaps">AI</a>
        <a class="chip" routerLink="/roadmaps">UX/UI</a>
        <a class="chip" routerLink="/roadmaps">Cloud</a>
        <a class="chip" routerLink="/roadmaps">Seguridad</a>
      </section>

      <!-- Estadísticas / confianza -->
      <section class="stats">
        <div class="stat fade"><span class="num">12k+</span><span class="label">roadmaps</span></div>
        <div class="stat fade" style="animation-delay: .06s"><span class="num">8k+</span><span class="label">creadores</span></div>
        <div class="stat fade" style="animation-delay: .12s"><span class="num">120k+</span><span class="label">aprendices</span></div>
      </section>

      <!-- Sección de features -->
      <section class="features">
        <div class="feature">
          <h3>Crea y comparte</h3>
          <p>Diseña rutas de aprendizaje profesionales y publícalas para la comunidad.</p>
        </div>
        <div class="feature">
          <h3>Sigue a creadores</h3>
          <p>Descubre expertos y aprende con sus guías y recomendaciones.</p>
        </div>
        <div class="feature">
          <h3>Colabora y comenta</h3>
          <p>Recibe feedback, mejora tus roadmaps y ayuda a otros a crecer.</p>
        </div>
        <div class="feature">
          <h3>Recursos organizados</h3>
          <p>Encuentra artículos, videos y retos ordenados paso a paso.</p>
        </div>
      </section>

      <!-- Cómo funciona -->
      <section class="how">
        <h2>Cómo funciona</h2>
        <ol class="steps">
          <li>
            <span class="step-title">Elige un objetivo</span>
            <span class="step-desc">Define la meta: un rol, una habilidad o una certificación.</span>
          </li>
          <li>
            <span class="step-title">Sigue una ruta</span>
            <span class="step-desc">Explora roadmaps verificados o crea el tuyo desde cero.</span>
          </li>
          <li>
            <span class="step-title">Mide tu progreso</span>
            <span class="step-desc">Marca avances, guarda recursos y comparte tus logros.</span>
          </li>
        </ol>
      </section>

      <!-- CTA final (eliminado para evitar redundancia) -->
    </div>
  `,
  styles: [
    `
    :host { display: block; }
    .landing { position: relative; min-height: 100vh; color: var(--color-text); background: linear-gradient(160deg, var(--color-bg) 0%, var(--color-bg-2) 60%); overflow: hidden; }
    .network-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
    .canvas { width: 100%; height: 100%; display: block; }
    .bg-gradient { position: absolute; inset: -20% -10% auto -10%; height: 60vh; background: radial-gradient( circle at 30% 20%, rgba(124,58,237,.16), transparent 60% ), radial-gradient( circle at 70% 10%, rgba(226,59,240,.16), transparent 55% ); filter: blur(40px); pointer-events: none; z-index: 0; }
    .blob { position: absolute; left: 50%; top: 10%; width: 500px; height: 300px; transform: translateX(-50%); background: radial-gradient(circle at 30% 20%, #e23bf0, #7c3aed 60%); filter: blur(60px) saturate(110%); opacity: 0.35; pointer-events: none; z-index: 0; }

    .hero { position: relative; z-index: 1; text-align: center; padding: 80px 24px 40px; max-width: 1100px; margin: 0 auto; }
    .pill { display:inline-block; color:#c9b8ff; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.2); border-radius: 999px; padding: 10px 18px; margin-bottom: 24px; box-shadow: 0 0 0 1px rgba(255,255,255,.08) inset; }
    h1 { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: clamp(40px, 7vw, 72px); line-height: 1.05; letter-spacing: -.02em; margin: 0 0 16px; color: #dbd5ff; }
    .subtitle { max-width: 720px; margin: 0 auto 24px; color: var(--color-muted); font-size: 18px; }
    .cta { display:flex; justify-content:center; gap:12px; margin-bottom: 28px; }
    .search { max-width: 900px; margin: 0 auto; padding: 14px; }
    .search input { width: 100%; padding: 14px 16px; border-radius: 14px; border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: #e9e6ff; outline: none; transition: border-color .2s ease, background .2s ease; }
    .search input::placeholder { color: #c9b8ff; }
    .search input:hover { background: rgba(255,255,255,.08); }
    .search input:focus { border-color: rgba(124,58,237,.35); }
    .search .hint { margin-top: 8px; color: var(--color-muted); font-size: 13px; }

    .featured-grid { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; max-width: 1100px; margin: 18px auto; padding: 0 24px; }
    .card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.16); border-radius: 16px; padding: 16px; backdrop-filter: saturate(110%) blur(6px); transition: transform .2s ease, box-shadow .2s ease; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(124,58,237,.18); }
    .card h3 { margin: 0 0 6px; color: #e9e6ff; font-weight: 600; }
    .card p { margin: 0 0 10px; color: var(--color-muted); }
    .card .meta { display:flex; gap:10px; color: #cfc9ff; font-size: 13px; margin-bottom: 8px; }
    .card .link { display:inline-block; color:#c9b8ff; border:1px solid rgba(255,255,255,.16); border-radius: 999px; padding: 6px 10px; background: rgba(255,255,255,.06); }

    .chip-row { position: relative; z-index: 1; display:flex; gap:10px; max-width: 1100px; margin: 8px auto 0; padding: 0 24px 4px; overflow-x: auto; }
    .chip { flex: 0 0 auto; color:#c9b8ff; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.16); border-radius: 999px; padding: 8px 12px; }

    .stats { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; max-width: 900px; margin: 18px auto; padding: 0 24px; }
    .stat { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.16); border-radius: 16px; padding: 14px; text-align: center; }
    .stat .num { display:block; font-size: 28px; color:#e9e6ff; font-weight: 700; }
    .stat .label { display:block; color: var(--color-muted); font-size: 14px; }

    .features { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; max-width: 1100px; margin: 24px auto; padding: 0 24px; }
    .feature { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.16); border-radius: 16px; padding: 18px; backdrop-filter: saturate(110%) blur(6px); }
    .feature h3 { margin: 0 0 6px; color: #e9e6ff; font-weight: 600; }
    .feature p { margin: 0; color: var(--color-muted); }

    .how { position: relative; z-index: 1; max-width: 900px; margin: 40px auto; padding: 0 24px; text-align: center; }
    .how h2 { margin: 0 0 12px; color: #e9e6ff; font-size: 28px; }
    .steps { list-style: none; display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; margin: 0; padding: 0; }
    .steps li { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.16); border-radius: 16px; padding: 16px; text-align: left; }
    .step-title { display:block; font-weight:600; color:#e9e6ff; margin-bottom:4px; }
    .step-desc { color: var(--color-muted); }

    /* Animaciones suaves */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
    .fade { animation: fadeUp .6s ease both; }

    @media (max-width: 960px) {
      .hero { padding: 64px 16px 32px; }
      .features { grid-template-columns: 1fr 1fr; }
      .featured-grid { grid-template-columns: 1fr 1fr; }
      .steps { grid-template-columns: 1fr; }
      .stats { grid-template-columns: 1fr 1fr; }
    }
    `
  ]
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx?: CanvasRenderingContext2D | null;
  private animationId?: number;
  private nodes: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string }> = [];
  private resizeHandler = () => this.updateSize();

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.updateSize();
    window.addEventListener('resize', this.resizeHandler);

    const rect = canvas.getBoundingClientRect();
    const nodeCount = 60;
    const colors = [
      'rgba(168, 85, 247, 0.45)',
      'rgba(192, 132, 252, 0.45)',
      'rgba(147, 51, 234, 0.45)'
    ];
    this.nodes = Array.from({ length: nodeCount }).map(() => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      radius: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    const animate = () => {
      if (!this.ctx) return;
      const rect = canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      for (const node of this.nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > rect.width) node.vx *= -1;
        if (node.y < 0 || node.y > rect.height) node.vy *= -1;

        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = node.color;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = node.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }

      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        for (let j = i + 1; j < this.nodes.length; j++) {
          const other = this.nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 170) {
            const opacity = (1 - distance / 170) * 0.25;
            this.ctx.beginPath();
            this.ctx.moveTo(node.x, node.y);
            this.ctx.lineTo(other.x, other.y);
            this.ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            this.ctx.lineWidth = 0.75;
            this.ctx.stroke();
          }
        }
      }

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private updateSize() {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }
}
