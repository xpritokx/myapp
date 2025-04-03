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
import { BehaviorSubject } from 'rxjs';

import { DeleteCustomerDialogComponent } from './delete/delete-customer.component';
import { CustomersService } from '../../services/customers.service';

import { ICustomer } from '../../interfaces/customer.interface';

import { ErrorDialogWindow } from '../error/error-dialog.component';
import { EditCustomerDialogComponent } from './edit/edit-customer.component';
import { CreateCustomerDialogComponent } from './add/add-customer.component';
import { FilterCustomersDialogComponent } from './filter/customer-filter.component';

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
    <section class="customer-section">
        <table *ngIf="!(loading$ | async)" mat-table [dataSource]="dataSource" class="mat-elevation-z8 table-content" (matSortChange)="sortData($event)" matSort>
            <ng-container matColumnDef="Name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Customer Name </th>
                <td mat-cell *matCellDef="let element"> {{element.Name}} </td>
            </ng-container>
            <ng-container matColumnDef="Address">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Address </th>
                <td mat-cell *matCellDef="let element"> {{element.Address}} </td>
            </ng-container>
            <ng-container matColumnDef="Comments">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Comments </th>
                <td mat-cell *matCellDef="let element"> {{element.Comments}} </td>
            </ng-container>

            <ng-container matColumnDef="ActionButtons" stickyEnd>
                <th mat-header-cell *matHeaderCellDef></th>
                <td class="button-row-col" mat-cell *matCellDef="let element">
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
    
    <mat-paginator 
        [pageSizeOptions]="[25, 50, 75, 100]"
        [length]="total"
        (page)="handlePageEvent($event)"
    ></mat-paginator>
  `,
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent {
    readonly dialog = inject(MatDialog);
    public readonly deviceDetectorService = inject(DeviceDetectorService);
    public loading$ = new BehaviorSubject<boolean>(false);
    
    customersService = inject(CustomersService);

    searchParams = {
        search: '',
        searchField: '',
        dateFrom: '',
        dateTo: '',
        searchDateField: ''
    };
    searchParamsEnabled:boolean = false;

    displayedColumns: string[] = [
        'Name',
        'Address',
        'Comments',
        'ActionButtons'
    ];

    mockDate: any = {
        Name: 'Name',
        Address: 'Address',
        Comments: 'Comments'
    }

    dataSource!: MatTableDataSource<ICustomer>;
    total: number = 0;

    @ViewChild(MatPaginator)
    paginator!: MatPaginator;
    @ViewChild(MatSort)
    sort!: MatSort;

    pageSize: number = 25;
    pageIndex: number = 0;
    sortingDirection: string = 'asc'; 
    sortingColumn: string = 'Name';
    customers: {
        'Name': string
    }[] = [];

    constructor() {
        this.getCustomers();
    }

    async getCustomers() {
        this.loading$.next(true);

        try {
            const customers: {
                data: ICustomer[];
                total: number;
            } = await this.customersService.getCustomersList(
                this.pageSize,
                this.pageIndex,
                this.sortingColumn,
                this.sortingDirection,
                this.searchParams
            );
    
            this.loading$.next(false);
            this.total = customers?.total || 0;
    
            this.dataSource = new MatTableDataSource(customers?.data || []);
            /* this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort; */
            this.customers = customers?.data || [];
        } catch (err: any) {
            this.loading$.next(false);
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }

    openEditDialog(customer: ICustomer) {
        console.log('--DEBUG-- edit customer dialog opened: ', customer);
        const dialogRef = this.dialog.open(EditCustomerDialogComponent, {
            data: customer
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- edit dialog result: ${result}`);
        
            if (result === 'updated') {
                this.getCustomers();
            }
        });
    }
    
    openDeleteDialog(customer: ICustomer) {
        console.log('--DEBUG-- delete customer dialog opened: ', customer);

        const dialogRef = this.dialog.open(DeleteCustomerDialogComponent, {
            data: {
                ID: customer.ID,
                Name: customer.Name
            }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            console.log(`--DEBUG-- delete dialog result: ${result}`);

            if (result) {
                await this.customersService.deleteCustomer(
                    customer.ID, 
                );

                this.getCustomers();
            }
        });
    }

    handlePageEvent(e: PageEvent) {
        console.log('--DEBUG-- handlePageEvent: ', e);
        this.pageSize = e.pageSize;
        this.pageIndex = e.pageIndex;

        this.getCustomers();
    }

    sortData(sort: Sort) {
        console.log('--DEBUG-- sort customers button: ', sort);
    };

    add() {
        console.log('--DEBUG-- add customer dialog opened!');

        const dialogRef = this.dialog.open(CreateCustomerDialogComponent);

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- add customer dialog result:`, result);

            if (result === 'updated') {
                this.getCustomers();
            }
        });
    }

    filter() {
        console.log('--DEBUG-- customers filter dialog opened!');

        const dialogRef = this.dialog.open(FilterCustomersDialogComponent);

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

            this.getCustomers();
        });
    }

    filterOff() {
        console.log('--DEBUG-- customers filters off');

        this.searchParams = {
            search: '',
            searchField: '',
            dateFrom: '',
            dateTo: '',
            searchDateField: ''
        };

        this.searchParamsEnabled = false;

        this.getCustomers();
    }
}
