import { Component } from '@angular/core';

@Component({
  selector: 'app-roadmaps-ai',
  standalone: true,
  template: `
    <section class="page">
      <h1>Roadmaps IA</h1>
      <p>Genera roadmaps personalizados con Inteligencia Artificial.</p>
    </section>
  `,
  styles: [` .page { padding: 24px; } h1 { font-size: 1.6rem; margin-bottom: 8px; } p { color: #555; } `]
})
export class RoadmapsAIPage {}