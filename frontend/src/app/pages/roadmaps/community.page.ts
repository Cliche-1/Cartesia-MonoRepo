import { Component } from '@angular/core';

@Component({
  selector: 'app-roadmaps-community',
  standalone: true,
  template: `
    <section class="page">
      <h1>Roadmaps de la Comunidad</h1>
      <p>Explora roadmaps creados por otros usuarios.</p>
    </section>
  `,
  styles: [` .page { padding: 24px; } h1 { font-size: 1.6rem; margin-bottom: 8px; } p { color: #555; } `]
})
export class RoadmapsCommunityPage {}