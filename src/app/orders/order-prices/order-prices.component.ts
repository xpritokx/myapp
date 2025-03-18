import { Component, ChangeDetectionStrategy, Inject, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

import { PricesService } from '../../../services/prices.service';

import { ErrorDialogWindow } from '../../error/error-dialog.component';

@Component({
  selector: 'dialog-delete-stair',
  template: `
    <h2 mat-dialog-title>Prices of order #{{ data.orderNum }}</h2>
    <mat-dialog-content class="mat-typography text-area">
        <section class="list-prices">
            <table *ngIf="!(loading$ | async)" mat-table [dataSource]="dataSource" class="mat-elevation-z8 table-content">
                <ng-container matColumnDef="PriceCode" stickyEnd>
                    <th mat-header-cell *matHeaderCellDef> Price Code </th>
                    <td mat-cell *matCellDef="let element"> {{element.PriceCode}} </td>
                </ng-container>
                <ng-container matColumnDef="UnitPrice">
                    <th mat-header-cell *matHeaderCellDef>  Unit Price </th>
                    <td mat-cell *matCellDef="let element"> {{element.UnitPrice}} </td>
                </ng-container>
                <ng-container matColumnDef="Unit">
                    <th mat-header-cell *matHeaderCellDef> Unit </th>
                    <td mat-cell *matCellDef="let element"> {{element.Unit}} </td>
                </ng-container>
                <ng-container matColumnDef="Description">
                    <th mat-header-cell *matHeaderCellDef> Description </th>
                    <td mat-cell *matCellDef="let element"> {{element.Description}} </td>
                </ng-container>
                <ng-container matColumnDef="Tax">
                    <th mat-header-cell *matHeaderCellDef> Tax </th>
                    <td mat-cell *matCellDef="let element"> {{element.Tax}} </td>
                </ng-container>
                <ng-container matColumnDef="Tier">
                    <th mat-header-cell *matHeaderCellDef> Tier </th>
                    <td mat-cell *matCellDef="let element"> {{element.Tier}} </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            <div *ngIf="loading$ | async" class="spinning-loader" style="display: flex; justify-content: center; align-items: center; background: white;">
                <mat-progress-spinner
                    color="primary" 
                    mode="indeterminate">
                </mat-progress-spinner>
            </div>
        </section>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
    </mat-dialog-actions>
    <div class="order-prices-total">
        <p>Tax $: {{ tax.toFixed(3) }}</p>
        <p>Total $: {{ total.toFixed(3) }}</p>
    </div>
  `,
  styleUrls: ['./order-prices.component.scss'],
  imports: [ 
    MatButtonModule,
    MatDialogModule, 
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPricesComponent {
    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);

    total: number = 0;
    tax: number = 0;

    pricesService = inject(PricesService);

    prices: any[] = [];

    dataSource!: MatTableDataSource<any>;

    displayedColumns: string[] = [
        'PriceCode',
        'UnitPrice',
        'Unit',
        'Description',
        'Tax',
        'Tier'
    ];

    mockDate: any = {
        'PriceCode': 'Price Code',
        'UnitPrice': 'Unit Price',
        'Unit': 'Unit',
        'Description': 'Description',
        'Tax': 'Tax',
        'Tier': 'Tier'
    }

    constructor(@Inject(MAT_DIALOG_DATA) public data: {orderNum: string}) {}

    ngOnInit() {
        this.getPrices();
    }

    async getPrices() {
        this.loading$.next(true);

        try {
            const prices: {
                data: any[];
                total: number;
            } = await this.pricesService.getPricesByOrderNum(
                this.data.orderNum
            );

            this.prices = prices.data;

            this.loading$.next(false);

            this.total = this.prices.reduce((t, p) => {
                let amount = p.Amount;
                
                return t + amount; 
            }, 0);

            this.tax = this.total * 0.05;

            console.log('--DEBUG-- prices total: ', this.total);
            this.dataSource = new MatTableDataSource(this.prices || []);
        } catch (err: any) {
            this.loading$.next(false);
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }
}