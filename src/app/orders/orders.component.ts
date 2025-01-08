import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
// import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
import { OrdersService } from '../../services/orders.service';
import { IOrder } from '../../interfaces/order.interface';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteOrderDialogComponent } from './delete/delete-order.component';
import { EditOrderDialogComponent } from './edit/edit-order.component';

@Component({
  selector: 'app-auth',
  imports: [
    MatTableModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  template: `
    <section class="orders-section">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z8 table-content" matSort>
            <ng-container matColumnDef="ID">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
                <td mat-cell *matCellDef="let element"> {{element.ID}} </td>
            </ng-container>
            <ng-container matColumnDef="OrderNum">
                <th mat-header-cell *matHeaderCellDef> Order Num </th>
                <td mat-cell *matCellDef="let element"> {{element.OrderNum}} </td>
            </ng-container>
            <ng-container matColumnDef="Customer">
                <th mat-header-cell *matHeaderCellDef> Customer </th>
                <td mat-cell *matCellDef="let element"> {{element.Customer}} </td>
            </ng-container>
            <ng-container matColumnDef="BillingAddress">
                <th mat-header-cell *matHeaderCellDef> Billing Address </th>
                <td mat-cell *matCellDef="let element"> {{element.BillingAddress}} </td>
            </ng-container>
            <ng-container matColumnDef="Address">
                <th mat-header-cell *matHeaderCellDef> Address </th>
                <td mat-cell *matCellDef="let element"> {{element.Address}} </td>
            </ng-container>
            <ng-container matColumnDef="Model">
                <th mat-header-cell *matHeaderCellDef> Model </th>
                <td mat-cell *matCellDef="let element"> {{element.Model}} </td>
            </ng-container>
            <ng-container matColumnDef="StairsNum">
                <th mat-header-cell *matHeaderCellDef> Stairs Num </th>
                <td mat-cell *matCellDef="let element"> {{element.StairsNum}} </td>
            </ng-container>
            <ng-container matColumnDef="OrderDate">
                <th mat-header-cell *matHeaderCellDef> Order Date </th>
                <td mat-cell *matCellDef="let element"> {{element.OrderDate}} </td>
            </ng-container>
            <ng-container matColumnDef="DeliveryDate">
                <th mat-header-cell *matHeaderCellDef> Delivery Date </th>
                <td mat-cell *matCellDef="let element"> {{element.DeliveryDate}} </td>
            </ng-container>
            <ng-container matColumnDef="Height">
                <th mat-header-cell *matHeaderCellDef> Height </th>
                <td mat-cell *matCellDef="let element"> {{element.Height}} </td>
            </ng-container>
            <ng-container matColumnDef="Width">
                <th mat-header-cell *matHeaderCellDef> Width </th>
                <td mat-cell *matCellDef="let element"> {{element.Width}} </td>
            </ng-container>
            <ng-container matColumnDef="ActionButtons" stickyEnd>
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
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
    </section>
    <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of orders"></mat-paginator>
  `,
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent {
    readonly dialog = inject(MatDialog);
    ordersService = inject(OrdersService);

    displayedColumns: string[] = [
        'ID',
        'OrderNum',
        'Customer',
        'BillingAddress',
        'Address',
        'Model',
        'StairsNum',
        'OrderDate',
        'DeliveryDate',
        'Height',
        'Width',
        'ActionButtons',
    ];

    dataSource!: MatTableDataSource<IOrder>;
    ordersList: IOrder[] = [];
    
    @ViewChild(MatPaginator)
    paginator!: MatPaginator;
    @ViewChild(MatSort)
    sort!: MatSort;

    constructor() {
        this.getOrders();
    }

    async getOrders() {
        const ordersList = await this.ordersService.getOrders();
        this.dataSource = new MatTableDataSource(ordersList);
    }

    openEditDialog(order: IOrder) {
        console.log('--DEBUG-- edit dialog opened: ', order);
        const dialogRef = this.dialog.open(EditOrderDialogComponent, {
            data: order
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- edit dialog result: ${result}`);
        });
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    openDeleteDialog(order: IOrder) {
        console.log('--DEBUG-- delete dialog opened: ', order);
        const dialogRef = this.dialog.open(DeleteOrderDialogComponent, {
            data: {
                ID: order.ID,
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- delete dialog result: ${result}`);
        });
    }

    /* applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
    } */
}
