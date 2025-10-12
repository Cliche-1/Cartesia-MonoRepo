import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing.page';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, LandingComponent],
  template: `
    <app-landing></app-landing>
  `,
  styles: []
})
export class HomePage {}
