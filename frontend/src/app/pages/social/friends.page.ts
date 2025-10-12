import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page">
      <h1>Amigos</h1>
      <p class="muted">Esta sección está en desarrollo.</p>
      <div class="actions">
        <a class="btn ghost" routerLink="/perfil">Volver al perfil</a>
      </div>
    </section>
  `,
  styles: [` .page { padding: 24px; } .muted { color: var(--color-muted); } .actions { margin-top: 12px; } `]
})
export class FriendsPage {}