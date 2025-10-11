import { Component } from '@angular/core';

@Component({
  selector: 'app-roadmaps-official',
  standalone: true,
  template: `
    <section class="page">
      <h1>Roadmaps Oficiales</h1>
      <p>Roadmaps validados y curados por la comunidad.</p>
    </section>
  `,
  styles: [` .page { padding: 24px; } h1 { font-size: 1.6rem; margin-bottom: 8px; } p { color: #555; } `]
})
export class RoadmapsOfficialPage {}