import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from './shared/layout/navbar/navbar.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, NavbarComponent, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cartesia');
  constructor(private router: Router) {}

  shouldHideNavbar(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/roadmaps/editor');
  }
}
