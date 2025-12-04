import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  roadmapsOpen = signal(false);
  tutorOpen = signal(false);
  accountOpen = signal(false);
  langOpen = signal(false);
  username = '';
  avatarInitial = 'U';

  constructor(public api: ApiService, private router: Router) {
    const t = this.api.token;
    if (t) {
      try {
        const p = JSON.parse(atob(t.split('.')[1] || ''));
        this.username = String(p?.username || '');
        this.avatarInitial = (this.username || 'U').charAt(0).toUpperCase();
      } catch {}
    }
    effect(() => {
      const authed = this.api.authState();
      if (authed) {
        this.api.me().then(u => {
          this.username = u?.username || '';
          this.avatarInitial = (this.username || 'U').charAt(0).toUpperCase();
        }).catch(() => {});
      } else {
        this.username = '';
        this.avatarInitial = 'U';
      }
    });
    const saved = localStorage.getItem('lang');
    if (saved) { /* no-op, but keep selected */ }
  }

  toggleRoadmaps() { this.roadmapsOpen.update(v => !v); }
  toggleTutor() { this.tutorOpen.update(v => !v); }
  toggleAccount() { this.accountOpen.update(v => !v); }
  toggleLang() { this.langOpen.update(v => !v); }

  closeRoadmapsOnBlur(event: FocusEvent) {
    const target = event.target as HTMLElement;
    setTimeout(() => {
      if (!target.parentElement?.classList.contains('open')) return;
      this.roadmapsOpen.set(false);
    }, 120);
  }

  closeTutorOnBlur(event: FocusEvent) {
    const target = event.target as HTMLElement;
    setTimeout(() => {
      if (!target.parentElement?.classList.contains('open')) return;
      this.tutorOpen.set(false);
    }, 120);
  }

  closeAccountOnBlur(event: FocusEvent) {
    const target = event.target as HTMLElement;
    setTimeout(() => {
      if (!target.parentElement?.classList.contains('open')) return;
      this.accountOpen.set(false);
    }, 120);
  }

  goToAccount() {
    // Placeholder: redirige al inicio hasta que exista una página de perfil
    this.router.navigateByUrl('/');
  }

  logout() {
    this.api.token = null;
    this.accountOpen.set(false);
    this.router.navigateByUrl('/login');
  }

  setLang(code: 'es'|'en') {
    localStorage.setItem('lang', code);
    this.langOpen.set(false);
  }

  navigate(path: string) {
    this.router.navigateByUrl(path);
    this.roadmapsOpen.set(false);
    this.tutorOpen.set(false);
    this.accountOpen.set(false);
  }
}
