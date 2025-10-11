import { Component } from '@angular/core';

@Component({
  selector: 'app-tutor-learn',
  standalone: true,
  template: `
    <section class="page">
      <h1>Aprende con IA</h1>
      <p>Recibe una guía personalizada acerca de cualquier tema.</p>
    </section>
  `,
  styles: [` .page { padding: 24px; } h1 { font-size: 1.6rem; margin-bottom: 8px; } p { color: #555; } `]
})
export class TutorLearnAIPage {}