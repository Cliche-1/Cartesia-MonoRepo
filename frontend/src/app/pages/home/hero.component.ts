import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero px-6 py-12">
      <div class="max-w-6xl mx-auto">
        <!-- Hero card -->
        <div class="glass card p-8 md:p-12">
          <div class="flex items-center gap-3 mb-4">
            <span class="badge">Nuevo</span>
            <span class="text-xs" style="color: var(--color-muted)">Roadmaps guiados por IA</span>
          </div>

          <h1 class="hero-title m-0">Domina tu aprendizaje con Cartesia</h1>
          <p class="subtitle mt-3 mb-6">Crea, comparte y sigue roadmaps claros. Activa funciones Pro para acelerar con IA.</p>

          <div class="actions flex flex-col sm:flex-row gap-3">
            <a class="btn primary" routerLink="/roadmaps/editor">Crear roadmap</a>
            <a class="btn ghost" routerLink="/roadmaps/oficiales">Ver roadmaps</a>
          </div>

          <div class="mt-6 flex items-center gap-2 text-xs" style="color: var(--color-muted)">
            <i class="pi pi-shield"></i>
            <span>Gratis para siempre • Sin tarjeta de crédito</span>
          </div>
        </div>

        <!-- Features (resumen) -->
        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <article class="glass card p-4">
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(124,58,237,.12)"><i class="pi pi-check" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <h3 class="feat-title">Roadmaps curados</h3>
                <p class="feat-desc">Explora contenidos oficiales y de la comunidad</p>
              </div>
            </div>
          </article>
          <article class="glass card p-4">
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(124,58,237,.12)"><i class="pi pi-check" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <h3 class="feat-title">Editor visual</h3>
                <p class="feat-desc">Organiza tu camino y recursos con claridad</p>
              </div>
            </div>
          </article>
          <article class="glass card p-4">
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(124,58,237,.12)"><i class="pi pi-check" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <h3 class="feat-title">Impulso con IA</h3>
                <p class="feat-desc">Genera roadmaps y recibe guía personalizada</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero-title { font-weight: 700; line-height: 1.15; font-size: clamp(2rem, 5vw, 3rem); color: var(--color-text); }
      .subtitle { color: var(--color-muted); font-size: 0.95rem; }
      .badge { display:inline-block; padding:4px 10px; border-radius:999px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color: var(--color-text); font-weight:600; font-size:.75rem; }
      .feat-title { margin:0; font-size:.95rem; font-weight:600; color: var(--color-text); }
      .feat-desc { margin:2px 0 0; font-size:.8rem; color: var(--color-muted); }
    `
  ]
})
export class HeroSectionComponent {}
