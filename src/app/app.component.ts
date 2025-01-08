import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { TokenService } from '../services/token.service';
import { ConfigService } from '../services/config.service';
import { logoutButtonDisable, logoutButtonEnable } from '../actions/buttons.actions';
import { selectLogoutButton } from './selectors/buttons.selectors';
@Component({
  selector: 'app-root',
  imports: [RouterModule, CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
  template: `
    <main>
      <header class="brand-name">
        <a (click)="goToHome()">
          <img class="brand-logo" src="https://www.thestairshoppe.ca/images/logo1.png" alt="logo" aria-hidden="true" />
        </a>
        <button *ngIf="logoutButton$ | async"  mat-icon-button class="menu-button" [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="goToOrders()">
            <span>Orders</span>
          </button>
          <button mat-menu-item>
            <span>Shipping</span>
          </button>
          <button mat-menu-item>
            <span>Delivery</span>
          </button>
          <button mat-menu-item>
            <span>Customers</span>
          </button>
          <button mat-menu-item>
            <span>Prices</span>
          </button>
        </mat-menu>
          
        <button *ngIf="logoutButton$ | async" class="logout-button" (click)="logout()" role="button">Logout</button>
      </header>
      <section class="content">
        <router-outlet></router-outlet>
      </section>
      <section class="footer">
        <p>© Copyright 2025 Stair Shoppe</p>
      </section>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly store = inject(Store);
  private readonly tokenService = inject(TokenService);
  private readonly configService = inject(ConfigService);
  
  logoutButton$: Observable<boolean>;

  constructor(
    private router: Router
  ) {
    this.logoutButton$ = this.store.select(selectLogoutButton);
    this.getConfig();
  }

  async getConfig() {
    const config = await this.configService.getConfig();

    console.log('--DEBUG-- config', config);

    if (!config) {
        this.router.navigate(['/auth']);
    } else {
        this.store.dispatch(logoutButtonEnable());
    }
  }

  goToHome() {
    if (this.tokenService.getToken()) {
      this.router.navigate(['/home']);
      this.store.dispatch(logoutButtonEnable());
    }
  }

  goToOrders() {
    if (this.tokenService.getToken()) {
      this.router.navigate(['/orders']);
      this.store.dispatch(logoutButtonEnable());
    }
  }

  logout() {
    console.log('--DEBUG-- logout');
    this.tokenService.removeToken();
    this.store.dispatch(logoutButtonDisable());
    this.router.navigate(['/auth']);
  }

  title = 'angular-stair-shoppe';
}
