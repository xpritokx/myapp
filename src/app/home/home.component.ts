import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section  class="home-form">
        <h1 class="home-title"> Home </h1>
    </section>
  `,
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    private readonly store = inject(Store);

    constructor(
        private router: Router
    ) {}
}
