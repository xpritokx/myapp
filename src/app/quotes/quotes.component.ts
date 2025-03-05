import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sort, MatSort, MatSortModule } from '@angular/material/sort';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable, BehaviorSubject } from 'rxjs';

import { QuotesService } from '../../services/quotes.service';

import { IOrder } from '../../interfaces/order.interface';

import { ErrorDialogWindow } from '../error/error-dialog.component';
import { AddOrderDialogComponent } from '../orders/add/add-order.component';
import { EditOrderDialogComponent } from '../orders/edit/edit-order.component';
import { FilterOrdersDialogComponent } from '../orders/filter/filter-orders.component';

@Component({
  selector: 'app-auth',
  imports: [
    CommonModule,
    MatTableModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="quotes-section">
        <table *ngIf="!(loading$ | async)" mat-table [dataSource]="dataSource" class="mat-elevation-z8 table-content" (matSortChange)="sortData($event)" matSort>
            <ng-container matColumnDef="OrderNum">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Order Num </th>
                <td mat-cell *matCellDef="let element"> {{element.OrderNum}} </td>
            </ng-container>
            <ng-container matColumnDef="OrderDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Order Date </th>
                <td mat-cell *matCellDef="let element"> {{element.OrderDate}} </td>
            </ng-container>
            <ng-container matColumnDef="DeliveryDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Delivery Date </th>
                <td mat-cell *matCellDef="let element"> {{element.DeliveryDate}} </td>
            </ng-container>
            <ng-container matColumnDef="Customer">
                <th mat-header-cell *matHeaderCellDef> Customer </th>
                <td mat-cell *matCellDef="let element"> {{element.Customer}} </td>
            </ng-container>
            <ng-container matColumnDef="Address">
                <th mat-header-cell *matHeaderCellDef> Address </th>
                <td mat-cell *matCellDef="let element"> {{element.Address}} </td>
            </ng-container>
            <ng-container matColumnDef="Model">
                <th mat-header-cell *matHeaderCellDef> Model </th>
                <td mat-cell *matCellDef="let element"> {{element.Model}} </td>
            </ng-container>
            <ng-container matColumnDef="JobNum">
                <th mat-header-cell *matHeaderCellDef> Job # </th>
                <td mat-cell *matCellDef="let element"> {{element.JobNum}} </td>
            </ng-container>
            <ng-container matColumnDef="PONum">
                <th mat-header-cell *matHeaderCellDef> PO # </th>
                <td mat-cell *matCellDef="let element"> {{element.PONum}} </td>
            </ng-container>

            <ng-container matColumnDef="WorkorderComments">
                <th mat-header-cell *matHeaderCellDef> Comment </th>
                <td mat-cell *matCellDef="let element"> {{element.WorkorderComments}} </td>
            </ng-container>

            <ng-container matColumnDef="InputBy">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Input By </th>
                <td mat-cell *matCellDef="let element"> {{element.InputBy}} </td>
            </ng-container>

            <ng-container matColumnDef="OfficeNote">
                <th mat-header-cell *matHeaderCellDef> Office Note </th>
                <td mat-cell *matCellDef="let element"> {{element.PublicComment}} </td>
            </ng-container>

            <ng-container matColumnDef="StairsNum">
                <th mat-header-cell *matHeaderCellDef> # Stairs </th>
                <td mat-cell *matCellDef="let element"> {{element.StairsNum}} </td>
            </ng-container>

            <ng-container matColumnDef="CustomDelivery">
                <th mat-header-cell *matHeaderCellDef> Custom </th>
                <td mat-cell *matCellDef="let element"> {{element.CustomDelivery}} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr (click) = "openEditDialog(row)" mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <div *ngIf="loading$ | async" class="spinning-loader" style="display: flex; justify-content: center; align-items: center; background: white;">
            <mat-progress-spinner
                color="primary" 
                mode="indeterminate">
            </mat-progress-spinner>
        </div>
    </section>

    <!-- buttons fot mobile version -->
    <button class="add-new-btn-mobile" *ngIf="deviceDetectorService.isMobile()" (click)="add()" mat-mini-fab>
        <mat-icon>add</mat-icon>
    </button>
    <button class="filter-btn-mobile" *ngIf="deviceDetectorService.isMobile()" ngClass="{{ searchParamsEnabled ? 'search-params-enabled' : '' }}" (click)="filter()" mat-mini-fab>
        <mat-icon>filter_alt</mat-icon>
    </button>
    <button class="filter-btn-off-mobile" *ngIf="searchParamsEnabled && deviceDetectorService.isMobile()" (click)="filterOff()" mat-mini-fab>
        <mat-icon>filter_alt_off</mat-icon>
    </button>
    <!-- buttons fot mobile version -->

    <!-- buttons fot desktop version -->
    <button class="add-new-btn" *ngIf="!deviceDetectorService.isMobile()" (click)="add()" mat-mini-fab>
        <mat-icon>add</mat-icon>
    </button>
    <button class="filter-btn" *ngIf="!deviceDetectorService.isMobile()" ngClass="{{ searchParamsEnabled ? 'search-params-enabled' : '' }}" (click)="filter()" mat-mini-fab>
        <mat-icon>filter_alt</mat-icon>
    </button>
    <button class="filter-btn-off" *ngIf="searchParamsEnabled && !deviceDetectorService.isMobile()" (click)="filterOff()" mat-mini-fab>
        <mat-icon>filter_alt_off</mat-icon>
    </button>
    <div *ngIf="searchParamsEnabled && !deviceDetectorService.isMobile()" class="filter-container">
        <p *ngIf="searchParams.searchField && searchParams.searchField !== 'not-selected'">{{mockDate[searchParams.searchField]}} = {{searchParams.search}}</p>
        <p *ngIf="searchParams.searchDateField && searchParams.searchDateField !== 'not-selected'">{{mockDate[searchParams.searchDateField]}} from {{searchParams.dateFrom}} to {{searchParams.dateTo}}</p>
    </div>
    <!-- buttons fot desktop version -->
    <mat-paginator 
        [pageSizeOptions]="[25, 50, 75, 100]"
        [length]="total"
        (page)="handlePageEvent($event)"
    ></mat-paginator>
  `,
  styleUrls: ['./quotes.component.scss'],
})
export class QuotesComponent {
    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);
    public readonly deviceDetectorService = inject(DeviceDetectorService);
    quotesService = inject(QuotesService);

    searchParams = {
        search: '',
        searchField: '',
        dateFrom: '',
        dateTo: '',
        searchDateField: ''
    };
    searchParamsEnabled:boolean = false;

    displayedColumns: string[] = [
        'OrderNum',
        'OrderDate',
        'DeliveryDate',
        'Customer',
        'Address',
        'Model',
        'JobNum',
        'PONum',
        'WorkorderComments',
        'InputBy',
        'OfficeNote',
        'StairsNum',
        'CustomDelivery',
    ];

    mockDate: any = {
        ShipDate: 'Shipping date',
        DeliveryDate: 'Delivery date',
        OrderDate: 'Order Date',
        OrderNum: 'Order Num',
        Customer: 'Customer',
        Address: 'Address',
        Model: 'Model',
        JobNum: 'Job',
        PONum: 'PO#',
        Status: 'ShipStatus',
        Comment: 'WorkorderComments',
        InputBy: 'Input By',
        OfficeNote: 'PublicComment',
        Custom: 'Custom Delivery'
    }

    dataSource!: MatTableDataSource<IOrder>;
    total: number = 0;

    @ViewChild(MatPaginator)
    paginator!: MatPaginator;
    @ViewChild(MatSort)
    sort!: MatSort;

    pageSize: number = 25;
    pageIndex: number = 0;
    sortingDirection: string = 'desc'; 
    sortingColumn: string = 'OrderDate';

    constructor() {
        this.getQuotes();
    }

    async getQuotes() {
        this.loading$.next(true);

        try {
            const quotes: {
                data: IOrder[];
                total: number;
            } = await this.quotesService.getQuotesList(
                this.pageSize,
                this.pageIndex,
                this.sortingColumn,
                this.sortingDirection,
                this.searchParams
            );

            this.loading$.next(false);
            this.total = quotes?.total || 0;

            this.dataSource = new MatTableDataSource(quotes?.data || []);
        } catch (err: any) {
            this.loading$.next(false);
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }

    openEditDialog(quote: IOrder) {
        console.log('--DEBUG-- edit quote dialog opened: ', quote);
        const dialogRef = this.dialog.open(EditOrderDialogComponent, {
            data: {
                ...quote,
                quote: true,
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- edit dialog result: ${result}`);
        
            if (result === 'deleted') {
                this.getQuotes();
            }
        });
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    handlePageEvent(e: PageEvent) {
        console.log('--DEBUG-- quotes handlePageEvent: ', e);
        this.pageSize = e.pageSize;
        this.pageIndex = e.pageIndex;

        this.getQuotes();
    }

    sortData(sort: Sort) {
        console.log('--DEBUG-- quotes sort button: ', sort);

        if (this.sortingColumn == sort.active) {
            this.sortingDirection = this.sortingDirection == 'asc' ? 'desc' : 'asc';
        } else {
            this.sortingDirection = 'asc';
        }

        this.sortingColumn = sort.active;

        this.getQuotes();
    };

    add() {
        console.log('--DEBUG-- quotes add dialog opened!');

        const dialogRef = this.dialog.open(AddOrderDialogComponent, {
            data: {
                quote: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- add dialog result:`, result);

            if (result?.status) {
                this.getQuotes();

            }
        });
    }

    filter() {
        console.log('--DEBUG-- quotes filter dialog opened!');

        const dialogRef = this.dialog.open(FilterOrdersDialogComponent);

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- filter dialog result:`, result);

            if ((!result.searchDateField && !result.searchField) ||
                result.searchDateField === 'not-selected' &&
                result.searchField === 'not-selected'
            ) {
                return;
            }

            this.searchParamsEnabled = true;
            this.searchParams = result;

            this.getQuotes();
        });
    }

    filterOff() {
        console.log('--DEBUG-- quotes filters off');

        this.searchParams = {
            search: '',
            searchField: '',
            dateFrom: '',
            dateTo: '',
            searchDateField: ''
        };

        this.searchParamsEnabled = false;

        this.getQuotes();
    }
}
