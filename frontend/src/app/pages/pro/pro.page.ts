import { Component } from '@angular/core';

@Component({
  selector: 'app-pro-plans',
  standalone: true,
  template: `
    <section class="page">
      <h1>Planes Pro</h1>
      <p>Desbloquea funciones premium para una experiencia completa.</p>
    </section>
  `,
  styles: [` .page { padding: 24px; } h1 { font-size: 1.6rem; margin-bottom: 8px; } p { color: #555; } `]
})
export class ProPlansPage {}