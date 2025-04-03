import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Store } from '@ngrx/store';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BehaviorSubject } from 'rxjs';

import { OrdersService } from '../../services/orders.service';

import { IOrder } from '../../interfaces/order.interface';

import { ErrorDialogWindow } from '../error/error-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    NgxChartsModule
  ],
  template: `
    <section  class="home-form">
      <div class="home-title-container"><h1 class="home-title">Welcome to Stairs CRM</h1></div>
      
      <div class="cnt-of-order-data">
        <div class="cnt-of-orders-chart-container"><h1 class="cnt-of-orders-chart">Count of orders for the last year chart</h1></div>
        <div *ngIf="!(loading$ | async)" style="overflow: auto;">
          <ngx-charts-bar-horizontal
            [view]="view"
            [scheme]="colorScheme"
            [results]="chartsOfOrdersCountData"
            [gradient]="gradient"
            [xAxis]="showXAxis"
            [yAxis]="showYAxis"
            [legend]="showLegend"
            [showXAxisLabel]="showXAxisLabel"
            [showYAxisLabel]="showYAxisLabel"
            [xAxisLabel]="xAxisLabel"
            [yAxisLabel]="yAxisLabel"
            (select)="onSelect($event)"
            (activate)="onActivate($event)"
            (deactivate)="onDeactivate($event)">
          </ngx-charts-bar-horizontal>
        </div>
        <div *ngIf="loading$ | async" class="spinning-loader" style="display: flex; justify-content: center; align-items: center; background: white;">
          <mat-progress-spinner
              color="primary" 
              mode="indeterminate">
          </mat-progress-spinner>
        </div>
      </div>
      
    </section>
  `,
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    readonly dialog = inject(MatDialog);
    ordersService = inject(OrdersService);
    public loading$ = new BehaviorSubject<boolean>(false);

    showXAxis: boolean = true;
    showYAxis: boolean = true;
    gradient: boolean = false;
    showLegend: boolean = true;
    showXAxisLabel: boolean = true;
    yAxisLabel: string = 'Months';
    showYAxisLabel: boolean = true;
    xAxisLabel: string = 'Count of orders';

    view: [number, number] = [700, 400];

    total: number = 0;

    colorScheme: any = {
      domain: [
        "#FF5733", // Bright Red-Orange
        "#33A1FF", // Sky Blue
        "#FFC300", // Warm Yellow
        "#2ECC71", // Soft Green
        "#9B59B6", // Purple
        "#E74C3C", // Red
        "#F39C12", // Orange
        "#1ABC9C", // Turquoise
        "#34495E", // Dark Blue-Gray
        "#D35400", // Deep Orange
        "#27AE60", // Emerald Green
        "#8E44AD"  // Dark Purple
      ]
    };

    chartsOfOrdersCountData: any[] = [];
    chartsOfOrdersCount = [];

    constructor() {
      this.getCountOfOrdersData();
    }

    async getCountOfOrdersData() {
      this.loading$.next(true);

      const dateNow = new Date();
      const dateFrom = dateNow.setFullYear(dateNow.getFullYear() - 1);

      try {
          const orders: {
              data: IOrder[];
              total: number;
          } = await this.ordersService.getOrdersList(
              10000,
              0,
              '',
              '',
              {
                search: '',
                searchField: '',
                dateFrom: new Date(dateFrom).toString(),
                dateTo: new Date().toString(),
                searchDateField: 'OrderDate'
              }
          );

          this.loading$.next(false);
          this.total = orders?.total || 0;
          this.chartsOfOrdersCount = this.groupByMonth(orders.data);
               
          Object.keys(this.chartsOfOrdersCount).forEach((month: any) => {
            const count: any[] = this.chartsOfOrdersCount[month] || [];

            this.chartsOfOrdersCountData.push({
              name: month,
              value: count.length,
            });
          });
          
          console.log('--DEBUG-- count of orders data: ', this.chartsOfOrdersCountData);
          
      } catch (err: any) {
          this.loading$.next(false);
          this.dialog.open(ErrorDialogWindow, {
              data: {
                  errorMessage: err?.error || err
              }
          });
      }
    }
  
    onSelect(data: any): void {
      console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    }
  
    onActivate(data: any): void {
      console.log('Activate', JSON.parse(JSON.stringify(data)));
    }
  
    onDeactivate(data: any): void {
      console.log('Deactivate', JSON.parse(JSON.stringify(data)));
    }

    groupByMonth(data: any[]) {
      const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
      ];
  
      const groupedData: any = {};
  
      // Initialize empty arrays for each month
      months.forEach(month => groupedData[month] = []);
  
      // Sort data into the respective month
      data.forEach(item => {
          const monthName: string = months[new Date(item.OrderDate).getMonth()];
          groupedData[monthName].push(item);
      });
  
      return groupedData;
  }
}
