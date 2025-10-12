import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pro-plans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page pro px-6">
      <header class="text-center mx-auto max-w-3xl my-2 mb-8">
        <h1 class="text-2xl font-semibold">Elige tu plan</h1>
        <p class="text-sm" style="color: var(--color-muted)">Free para empezar, Pro para desbloquear IA y acelerar tu aprendizaje.</p>
      </header>

      <div class="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
        <!-- Card Free (formal, elegante, estilo del sitio) -->
        <article class="glass card transition-transform duration-200 hover:-translate-y-1">
          <div class="flex items-center justify-between mb-2">
            <h2 class="m-0 text-lg font-semibold">Free</h2>
            <span class="text-xs font-semibold text-white/90 px-2 py-1 rounded-full border border-white/20 bg-white/10">Gratis</span>
          </div>
          <p class="text-sm" style="color: var(--color-muted)">Empieza a explorar y crear roadmaps.</p>

          <div class="mt-4 space-y-3">
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(124,58,237,.12)"><i class="pi pi-check" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <p class="text-sm font-medium" style="color: var(--color-text)">Explora roadmaps oficiales y de la comunidad</p>
                <p class="text-xs" style="color: var(--color-muted)">Descubre contenidos curados</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(124,58,237,.12)"><i class="pi pi-check" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <p class="text-sm font-medium" style="color: var(--color-text)">Crea y edita roadmaps manualmente</p>
                <p class="text-xs" style="color: var(--color-muted)">Organiza pasos y recursos</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(124,58,237,.12)"><i class="pi pi-check" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <p class="text-sm font-medium" style="color: var(--color-text)">Guarda y comparte tu progreso</p>
                <p class="text-xs" style="color: var(--color-muted)">Comparte avances con tu equipo</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(124,58,237,.12)"><i class="pi pi-check" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <p class="text-sm font-medium" style="color: var(--color-text)">Editor visual básico</p>
                <p class="text-xs" style="color: var(--color-muted)">Edición rápida y clara</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <a routerLink="/register" class="btn primary">Empezar gratis</a>
          </div>
        </article>

        <!-- Card Pro (formal, elegante, estilo del sitio) -->
        <article class="glass card transition-transform duration-200 hover:-translate-y-1">
          <div class="flex items-center justify-between mb-2">
            <h2 class="m-0 text-lg font-semibold">Pro</h2>
            <span class="text-xs font-semibold text-white px-2 py-1 rounded-full" style="background: linear-gradient(135deg, #7c3aed, #6d28d9)">IA</span>
          </div>
          <p class="text-sm" style="color: var(--color-muted)">Desbloquea IA para crear, priorizar y aprender más rápido.</p>

          <div class="mt-4 space-y-3">
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(109,40,217,.12)"><i class="pi pi-sparkles" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <p class="text-sm font-medium" style="color: var(--color-text)">Genera roadmaps personalizados con IA</p>
                <p class="text-xs" style="color: var(--color-muted)">Contenido ajustado a tus objetivos</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(109,40,217,.12)"><i class="pi pi-graduation-cap" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <p class="text-sm font-medium" style="color: var(--color-text)">Tutor IA con recomendaciones y chat</p>
                <p class="text-xs" style="color: var(--color-muted)">Orientación continua y práctica</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(109,40,217,.12)"><i class="pi pi-bolt" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <p class="text-sm font-medium" style="color: var(--color-text)">Prioriza contenidos y recursos automáticamente</p>
                <p class="text-xs" style="color: var(--color-muted)">Plan inteligente y adaptable</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" style="background: rgba(109,40,217,.12)"><i class="pi pi-verified" style="color:#7c3aed; font-size:.85rem"></i></span>
              <div>
                <p class="text-sm font-medium" style="color: var(--color-text)">Actualizaciones y mejoras continuas</p>
                <p class="text-xs" style="color: var(--color-muted)">Nuevas funciones con frecuencia</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button class="btn accent" (click)="onProClick()">Obtener Pro</button>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: []
})
export class ProPlansPage {
  onProClick() {
    alert('Pro estará disponible pronto. ¡Gracias por tu interés!');
  }
}