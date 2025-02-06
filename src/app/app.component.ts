import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { TokenService } from '../services/token.service';
import { MaterialsService } from '../services/materials.service';
import { RiserTypesService } from '../services/riserTypes.service';
import { StairTypesService } from '../services/stairTypes.service';
import { StairStylesService } from '../services/stairStyles.service';
import { ConfigService } from '../services/config.service';
import { logoutButtonDisable, logoutButtonEnable } from '../actions/buttons.actions';
import { selectLogoutButton } from './selectors/buttons.selectors';
@Component({
  selector: 'app-root',
  imports: [
    RouterModule, 
    CommonModule, 
    MatButtonModule, 
    MatMenuModule, 
    MatIconModule
  ],
  template: `
    <main>
      <header class="brand-name">
        <a (click)="goToHome()">
          <img *ngIf="!deviceDetectorService.isMobile()" class="brand-logo" src="https://www.thestairshoppe.ca/images/logo1.png" alt="logo" aria-hidden="true" />
          <img *ngIf="deviceDetectorService.isMobile()" class="brand-logo-mobile" src="https://www.thestairshoppe.ca/images/logo1.png" alt="logo" aria-hidden="true">
        </a>
        <button *ngIf="(logoutButton$ | async) && !deviceDetectorService.isMobile()"  mat-icon-button class="menu-button" [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
        </button>
        <button *ngIf="(logoutButton$ | async) && deviceDetectorService.isMobile()"  mat-icon-button class="menu-button-mobile" [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="goToOrders()">
            <span>Orders</span>
          </button>
          <button mat-menu-item>
            <span>Quotes</span>
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
      <section *ngIf="!deviceDetectorService.isMobile()" class="footer">
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
  private readonly materialsService = inject(MaterialsService);
  private readonly stairStyleService = inject(StairStylesService);
  private readonly stairTypeService = inject(StairTypesService);
  private readonly riserTypeService = inject(RiserTypesService);
  public readonly deviceDetectorService = inject(DeviceDetectorService);

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
      await this.getMaterials();

      this.store.dispatch(logoutButtonEnable());
    }
  }

  async getMaterials() {
    const materials = await this.materialsService.getMaterials();
    const riserTypes = await this.riserTypeService.getRiserTypes();
    const stairTypes = await this.stairTypeService.getStairTypes();
    const stairStyles = await this.stairStyleService.getStairStyles();

    const materialsData = materials?.data || [];
    const riserTypesData = riserTypes?.data || [];
    const stairTypesData = stairTypes?.data || [];
    const stairStylesData = stairStyles?.data || [];

    this.materialsService.setMaterials(materialsData);
    this.riserTypeService.setRiserTypes(riserTypesData);
    this.stairTypeService.setStairTypes(stairTypesData);
    this.stairStyleService.setStairStyles(stairStylesData);
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
