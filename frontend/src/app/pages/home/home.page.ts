import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <section class="page">
      <h1>Bienvenido a Cartesia</h1>
      <p>Explora roadmaps y aprende con el Tutor IA.</p>
    </section>
  `,
  styles: [
    `
      .page { padding: 24px; }
      h1 { font-size: 1.6rem; margin-bottom: 8px; }
      p { color: #555; }
    `
  ]
})
export class HomePage {}