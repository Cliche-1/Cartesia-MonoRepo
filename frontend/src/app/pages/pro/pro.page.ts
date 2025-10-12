import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-pro-plans',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule, TooltipModule, RippleModule],
  template: `
    <section class="page pro pro-page">
      <header class="hero">
        <h1>Elige tu plan</h1>
        <p class="subtitle">Free para empezar, Pro para desbloquear IA y acelerar tu aprendizaje.</p>
      </header>

      <div class="plans pro-container">
        <p-card class="plan" pRipple>
          <ng-template pTemplate="header">
            <div class="plan-header">
              <h2>Free</h2>
              <p-tag value="Gratis" class="pro-tag free"></p-tag>
            </div>
          </ng-template>
          <div class="features">
            <div class="feat"><i class="pi pi-check"></i><span>Explora roadmaps oficiales y de la comunidad</span></div>
            <div class="feat"><i class="pi pi-check"></i><span>Crea y edita roadmaps manualmente</span></div>
            <div class="feat"><i class="pi pi-check"></i><span>Guarda y comparte tu progreso</span></div>
            <div class="feat"><i class="pi pi-check"></i><span>Editor visual básico</span></div>
          </div>
          <ng-template pTemplate="footer">
            <div class="actions">
              <a pButton class="p-button-outlined" routerLink="/register" label="Empezar gratis"></a>
            </div>
          </ng-template>
        </p-card>

        <p-card class="plan pro-card" pRipple>
          <ng-template pTemplate="header">
            <div class="plan-header">
              <h2>Pro</h2>
              <p-tag value="IA" class="pro-tag pro"></p-tag>
            </div>
          </ng-template>
          <div class="features">
            <div class="feat" pTooltip="Función potenciada por IA" tooltipPosition="top"><i class="pi pi-sparkles"></i><span>Genera roadmaps personalizados con IA</span></div>
            <div class="feat" pTooltip="Orientación inteligente y chat" tooltipPosition="top"><i class="pi pi-graduation-cap"></i><span>Tutor IA con recomendaciones y chat</span></div>
            <div class="feat" pTooltip="Planifica y prioriza automáticamente" tooltipPosition="top"><i class="pi pi-bolt"></i><span>Prioriza contenidos y recursos automáticamente</span></div>
            <div class="feat"><i class="pi pi-verified"></i><span>Actualizaciones y mejoras continuas</span></div>
          </div>
          <ng-template pTemplate="footer">
            <div class="actions">
              <button pButton class="p-button-rounded pro-cta" label="Obtener Pro" (click)="onProClick()"></button>
            </div>
          </ng-template>
        </p-card>
      </div>
    </section>
  `,
  styles: [
    `
      .pro { padding: 24px; }
      .hero { text-align: center; margin: 8px auto 24px; max-width: 780px; }
      .hero h1 { font-size: 1.8rem; margin: 0 0 8px; }
      .hero .subtitle { color: var(--color-muted, #bdb7e6); }

      .pro-container { max-width: 860px; margin: 0 auto; }
      .plans { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
      @media (max-width: 900px) { .plans { grid-template-columns: 1fr; } }
      .plan :where(.p-card) { height: 100%; }
      .plan-header { display:flex; align-items:center; justify-content: space-between; }
      .plan-header h2 { margin: 0; font-size: 1.3rem; }
      .features { display:flex; flex-direction:column; gap: 10px; padding: 6px 2px 2px; }
      .features span { line-height: 1.25; font-weight: 500; }
      .feat { display:flex; align-items:center; gap:10px; color: var(--color-text, #eae7ff); }
      .feat i { color: var(--tui-primary, #7c3aed); }
      .actions { display:flex; justify-content:flex-end; margin-top: 8px; }
      .pro-card .feat i { color: #7c3aed; }

      /* Personalización PrimeNG para matching del tema (glass/dark) */
      .pro-page .p-card { background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14); border-radius: 14px; color: var(--color-text); box-shadow: inset 0 0 0 1px rgba(255,255,255,.05), 0 10px 22px rgba(124,58,237,.12); transition: transform .18s ease, box-shadow .18s ease; }
      .pro-page .plan:hover .p-card { transform: translateY(-2px); box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), 0 18px 36px rgba(124,58,237,.18); }
      .pro-page .p-card .p-card-header, .pro-page .p-card .p-card-body, .pro-page .p-card .p-card-footer { background: transparent; }
      .pro-page .p-card .p-card-header { padding: 16px 18px; border-top-left-radius: 14px; border-top-right-radius: 14px; }
      .pro-page .p-card .p-card-body { padding: 16px 18px; }
      .pro-page .p-card .p-card-footer { padding: 12px 18px 16px; border-bottom-left-radius: 14px; border-bottom-right-radius: 14px; }

      .pro-page .pro-tag { border-radius: 999px; font-weight: 600; padding: 6px 10px; font-size: 12px; letter-spacing: .2px; }
      .pro-page .pro-tag.free { background: rgba(255,255,255,.12); color: var(--color-text); border: 1px solid rgba(255,255,255,.22); }
      .pro-page .pro-tag.pro { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; border: 0; box-shadow: 0 8px 18px rgba(124,58,237,.28); }

      .pro-page .p-button { border-radius: 999px; font-weight: 600; }
      .pro-page .plan .p-button.p-button-outlined:hover,
      .pro-page .plan .p-button.p-button-outlined:focus { color: #fff; border-color: rgba(255,255,255,.6); background: rgba(255,255,255,.08); box-shadow: none; }
      .pro-page .p-button:focus { box-shadow: 0 0 0 2px rgba(124,58,237,.45); }
      .pro-page .p-button.pro-cta { background: linear-gradient(135deg, #6d28d9, #5b21b6); border: 0; color:#fff; box-shadow: 0 12px 24px rgba(109,40,217,.35); }
      .pro-page .p-button.pro-cta:hover { background: linear-gradient(135deg, #7c3aed, #6d28d9); }
      .pro-page .p-button.p-button-outlined { color: #fff; border-color: rgba(255,255,255,.35); background: transparent; }
    `
  ]
})
export class ProPlansPage {
  onProClick() {
    alert('Pro estará disponible pronto. ¡Gracias por tu interés!');
  }
}