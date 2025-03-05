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

import { OrdersService } from '../../services/orders.service';

import { IOrder } from '../../interfaces/order.interface';

import { ErrorDialogWindow } from '../error/error-dialog.component';
import { AddOrderDialogComponent } from './add/add-order.component';
import { EditOrderDialogComponent } from './edit/edit-order.component';
import { FilterOrdersDialogComponent } from './filter/filter-orders.component';

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
    <section class="orders-section">
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
            
            <ng-container matColumnDef="Status">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let element"> {{element.ShipStatus}} </td>
            </ng-container>
            
            <ng-container matColumnDef="ShipDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Shipped Date </th>
                <td mat-cell *matCellDef="let element"> {{element.ShipDate}} </td>
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

            <!-- <ng-container matColumnDef="ActionButtons" stickyEnd>
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element">
                <div class="button-row">
                    <div class="flex-container">
                        <div class="button-container">
                            <button (click)="openEditDialog(element)" mat-mini-fab>
                                <mat-icon>edit</mat-icon>
                            </button>
                            <button (click)="openDeleteDialog(element)" mat-mini-fab>
                                <mat-icon>delete</mat-icon>
                            </button>
                        </div>
                    </div>
                </div>
                </td>
            </ng-container> -->

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
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent {
    readonly dialog = inject(MatDialog);
    public readonly deviceDetectorService = inject(DeviceDetectorService);
    public loading$ = new BehaviorSubject<boolean>(false);

    ordersService = inject(OrdersService);

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
        'Status',
        'ShipDate',
        'WorkorderComments',
        'InputBy',
        'OfficeNote',
        'StairsNum',
        'CustomDelivery',
        // 'ActionButtons',
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
        this.getOrders();
    }

    async getOrders() {
        this.loading$.next(true);

        try {
            const orders: {
                data: IOrder[];
                total: number;
            } = await this.ordersService.getOrdersList(
                this.pageSize,
                this.pageIndex,
                this.sortingColumn,
                this.sortingDirection,
                this.searchParams
            );

            this.loading$.next(false);
            this.total = orders?.total || 0;

            this.dataSource = new MatTableDataSource(orders?.data || []);
        } catch (err: any) {
            this.loading$.next(false);
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }

    openEditDialog(order: IOrder) {
        console.log('--DEBUG-- edit dialog opened: ', order);
        const dialogRef = this.dialog.open(EditOrderDialogComponent, {
            data: order
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- edit dialog result: ${result}`);
        
            if (result === 'deleted') {
                this.getOrders();
            }
        });
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    handlePageEvent(e: PageEvent) {
        console.log('--DEBUG-- handlePageEvent: ', e);
        this.pageSize = e.pageSize;
        this.pageIndex = e.pageIndex;

        this.getOrders();
    }

    sortData(sort: Sort) {
        console.log('--DEBUG-- sort button: ', sort);

        if (this.sortingColumn == sort.active) {
            this.sortingDirection = this.sortingDirection == 'asc' ? 'desc' : 'asc';
        } else {
            this.sortingDirection = 'asc';
        }

        this.sortingColumn = sort.active;

        this.getOrders();
    };

    add() {
        console.log('--DEBUG-- add dialog opened!');

        const dialogRef = this.dialog.open(AddOrderDialogComponent, {
            data: {
                quote: false,
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- add dialog result:`, result);

            if (result?.status) {
                this.getOrders();

            }
        });
    }

    filter() {
        console.log('--DEBUG-- filter dialog opened!');

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

            this.getOrders();
        });
    }

    filterOff() {
        console.log('--DEBUG-- filters off');

        this.searchParams = {
            search: '',
            searchField: '',
            dateFrom: '',
            dateTo: '',
            searchDateField: ''
        };

        this.searchParamsEnabled = false;

        this.getOrders();
    }
}
