import { Component } from '@angular/core';

@Component({
  selector: 'app-tutor-roadmap-chat',
  standalone: true,
  template: `
    <section class="page">
      <h1>Roadmap Chat</h1>
      <p>Obtén orientación y consejos sobre un roadmap específico.</p>
    </section>
  `,
  styles: [` .page { padding: 24px; } h1 { font-size: 1.6rem; margin-bottom: 8px; } p { color: #555; } `]
})
export class TutorRoadmapChatPage {}