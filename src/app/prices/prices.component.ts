import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

import { PricesService } from '../../services/prices.service';

import { ErrorDialogWindow } from '../error/error-dialog.component';
import { EditPriceComponent } from './edit/edit.component';

@Component({
  selector: 'prices-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="prices-section">
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

                <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
                <tr mat-row (click)="openEditDialog(row)" *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
    </section>
  `,
  styleUrls: ['./prices.component.scss'],
})
export class PricesComponent {
    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);

    pricesService = inject(PricesService);
    prices: any[] = [];

    dataSource!: MatTableDataSource<any>;

    displayedColumns: string[] = [
        'PriceCode',
        'UnitPrice',
        'Unit',
        'Description',
        'Tax'
    ];

    mockDate: any = {
        'PriceCode': 'Price Code',
        'UnitPrice': 'Unit Price',
        'Unit': 'Unit',
        'Description': 'Description',
        'Tax': 'Tax'
    }

    constructor() {}

    ngOnInit() {
        this.getPrices();
    }

    async getPrices() {
        this.loading$.next(true);

        try {
            const prices: {
                data: any[];
                total: number;
            } = await this.pricesService.getAllPrices();

            this.prices = prices.data;

            this.loading$.next(false);

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

    openEditDialog(price: any) {
        console.log('--DEBUG-- edit price dialog opened');
        const dialogRef = this.dialog.open(EditPriceComponent, {
            data: {
                PriceCode: price.PriceCode,
                UnitPrice: price.UnitPrice, 
                ID: price.ID
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- edit price dialog result: ${result}`);
        
            if (result === 'changed') {
                this.getPrices();
            }
        });
    }
}
