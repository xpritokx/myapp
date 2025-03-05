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

import { ModelsService } from '../../services/models.service';

import { IModels } from '../../interfaces/models.interface';

import { FilterModelsDialogComponent } from './filter/models-filter.component';
import { DeleteModelDialogComponent } from './delete-model/delete-model.component';
import { ErrorDialogWindow } from '../error/error-dialog.component';

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
    <section class="models-section">
        <table *ngIf="!(loading$ | async)" mat-table [dataSource]="dataSource" class="mat-elevation-z8 table-content" (matSortChange)="sortData($event)" matSort>
            <ng-container matColumnDef="Name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
                <td mat-cell *matCellDef="let element"> {{element.Name}} </td>
            </ng-container>
            <ng-container matColumnDef="Workorder">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Order Num </th>
                <td mat-cell *matCellDef="let element"> {{element.Workorder}} </td>
            </ng-container>

            <ng-container matColumnDef="ActionButtons" stickyEnd>
                <th mat-header-cell *matHeaderCellDef></th>
                <td class="button-row-col" mat-cell *matCellDef="let element">
                    <div class="button-row">
                        <div class="flex-container">
                            <div class="button-container">
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
    <button class="filter-btn-mobile" *ngIf="deviceDetectorService.isMobile()" ngClass="{{ searchParamsEnabled ? 'search-params-enabled' : '' }}" (click)="filter()" mat-mini-fab>
        <mat-icon>filter_alt</mat-icon>
    </button>
    <button class="filter-btn-off-mobile" *ngIf="searchParamsEnabled && deviceDetectorService.isMobile()" (click)="filterOff()" mat-mini-fab>
        <mat-icon>filter_alt_off</mat-icon>
    </button>
    <!-- buttons fot mobile version -->

    <!-- buttons fot desktop version -->
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
  styleUrls: ['./models.component.scss'],
})
export class ModelsComponent {
    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);
    public readonly deviceDetectorService = inject(DeviceDetectorService);
    modelsService = inject(ModelsService);

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
        'Workorder',
        'ActionButtons'
    ];

    mockDate: any = {
        Name: 'Name',
        Workorder: 'Workorder'
    }

    dataSource!: MatTableDataSource<IModels>;
    total: number = 0;

    @ViewChild(MatPaginator)
    paginator!: MatPaginator;
    @ViewChild(MatSort)
    sort!: MatSort;

    pageSize: number = 25;
    pageIndex: number = 0;
    sortingDirection: string = 'asc'; 
    sortingColumn: string = 'Name';

    constructor() {
        this.getModels();
    }

    async getModels() {
        this.loading$.next(true);

        try {
            const models: {
                data: IModels[];
                total: number;
            } = await this.modelsService.getModelsList(
                this.pageSize,
                this.pageIndex,
                this.sortingColumn,
                this.sortingDirection,
                this.searchParams
            );
    
            this.loading$.next(false);
            this.total = models?.total || 0;
    
            this.dataSource = new MatTableDataSource(models?.data || []);
        } catch (err: any) {
            this.loading$.next(false);
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    handlePageEvent(e: PageEvent) {
        console.log('--DEBUG-- models handlePageEvent: ', e);
        this.pageSize = e.pageSize;
        this.pageIndex = e.pageIndex;

        this.getModels();
    }

    sortData(sort: Sort) {
        console.log('--DEBUG-- models sort button: ', sort);

        if (this.sortingColumn == sort.active) {
            this.sortingDirection = this.sortingDirection == 'asc' ? 'desc' : 'asc';
        } else {
            this.sortingDirection = 'asc';
        }

        this.sortingColumn = sort.active;

        this.getModels();
    };

    openDeleteDialog(model: IModels) {
        console.log('--DEBUG-- models delete dialog opened!');
        
        const dialogRef = this.dialog.open(DeleteModelDialogComponent, {
            data: {
                ID: model.ID,
                Name: model.Name,
            }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            console.log(`--DEBUG-- delete dialog result: ${result}`);

            if (result) {
                try {
                    const requestResult = await this.modelsService.deleteModel(
                        model.ID, 
                    );

                    console.log('--DEBUG-- request result: ', requestResult);

                } catch (err: any) {
                    this.dialog.open(ErrorDialogWindow, {
                        data: {
                            errorMessage: err.error
                        }
                    });
                }
                this.getModels();
            }
        });
    }

    filter() {
        console.log('--DEBUG-- models filter dialog opened!');

        const dialogRef = this.dialog.open(FilterModelsDialogComponent);

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- filter models dialog result:`, result);

            if ((!result.searchDateField && !result.searchField) ||
                result.searchDateField === 'not-selected' &&
                result.searchField === 'not-selected'
            ) {
                return;
            }

            this.searchParamsEnabled = true;
            this.searchParams = result;

            this.getModels();
        });
    }

    filterOff() {
        console.log('--DEBUG-- models filters off');

        this.searchParams = {
            search: '',
            searchField: '',
            dateFrom: '',
            dateTo: '',
            searchDateField: ''
        };

        this.searchParamsEnabled = false;

        this.getModels();
    }

    
}
