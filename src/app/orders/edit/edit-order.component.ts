import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, BehaviorSubject } from 'rxjs';

import { IOrder } from '../../../interfaces/order.interface';

import { OrderStatus } from '../order-status/order-status.component';
import { OrderPricesComponent } from '../order-prices/order-prices.component';
import { PrintOrderComponent } from '../print/print-order.component';
import { OrderDetailsComponent } from '../details/order-details.component';
import { DeleteOrderDialogComponent } from '../delete-order/delete-order.component';

import { OrdersService } from '../../../services/orders.service';
@Component({
    selector: 'dialog-edit-order',
    template: `
        <h2 mat-dialog-title>{{ data.quote ? 'Quote' : 'Order' }} #{{ data.OrderNum }}</h2>
        <p class="date-created">Created {{ data.OrderDate }}</p>
        <mat-dialog-content class="mat-typography">
            <section class="work-order">
                <form class="form-order" [formGroup]="editOrderForm">
                    <mat-form-field class="full-width order-customer">
                        <mat-label for="customer">Customer</mat-label>
                        <input id="customer" [disabled]="true" matInput type="text" formControlName="customer" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="full-width order-address">
                        <mat-label for="address">Delivery Address</mat-label>
                        <input id="address" matInput type="text" formControlName="address" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="order-model">    
                        <mat-label for="model">Model</mat-label>
                        <input id="model" matInput type="text" formControlName="model" placeholder="Ex. 27230" />
                    </mat-form-field>
                        
                    <mat-form-field class="order-delivery-date">
                        <mat-label for="deliveryDate">Delivery date</mat-label>
                        <input id="deliveryDate" matInput type="text" formControlName="deliveryDate" placeholder="Ex. Base, Low, Mid" />
                    </mat-form-field>
                </form>
            </section>
            <section class="list-orders">
                <table *ngIf="!(loading$ | async)" mat-table [dataSource]="dataSource" class="mat-elevation-z8 table-content">
                    <ng-container matColumnDef="Stair" stickyEnd>
                        <th mat-header-cell *matHeaderCellDef> Stair # </th>
                        <td mat-cell *matCellDef="let element"> {{element.Stair}} </td>
                    </ng-container>
                    <ng-container matColumnDef="Location">
                        <th mat-header-cell *matHeaderCellDef> Location </th>
                        <td mat-cell *matCellDef="let element"> {{element.Location}} </td>
                    </ng-container>
                    <ng-container matColumnDef="SectionDesc">
                        <th mat-header-cell *matHeaderCellDef> Summary </th>
                        <td mat-cell *matCellDef="let element"> {{element.SectionDesc}} </td>
                    </ng-container>
                    <ng-container matColumnDef="Width">
                        <th mat-header-cell *matHeaderCellDef> Width </th>
                        <td mat-cell *matCellDef="let element"> {{element.Width}} </td>
                    </ng-container>
                    <ng-container matColumnDef="Height">
                        <th mat-header-cell *matHeaderCellDef> Height </th>
                        <td mat-cell *matCellDef="let element"> {{element.Height}} </td>
                    </ng-container>
                    <ng-container matColumnDef="RiseOfStair">
                        <th mat-header-cell *matHeaderCellDef> Rise </th>
                        <td mat-cell *matCellDef="let element"> {{element.RiseOfStair}} </td>
                    </ng-container>
                    <ng-container matColumnDef="OSM">
                        <th mat-header-cell *matHeaderCellDef> OSM </th>
                        <td mat-cell *matCellDef="let element"> {{element.OSM}} </td>
                    </ng-container>
                    <ng-container matColumnDef="headroomlength">
                        <th mat-header-cell *matHeaderCellDef> Length </th>
                        <td mat-cell *matCellDef="let element"> {{element.headroomlength}} </td>
                    </ng-container>
                    <ng-container matColumnDef="StairRun">
                        <th mat-header-cell *matHeaderCellDef> Run </th>
                        <td mat-cell *matCellDef="let element"> {{element.StairRun}} </td>
                    </ng-container>
                    <ng-container matColumnDef="OrderType">
                        <th mat-header-cell *matHeaderCellDef> Extra details </th>
                        <td mat-cell *matCellDef="let element"> {{element.OrderType}} </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
                    <tr mat-row (click)=open(row) *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
                <div *ngIf="loading$ | async" class="spinning-loader" style="display: flex; justify-content: center; align-items: center; background: white;">
                    <mat-progress-spinner
                        color="primary" 
                        mode="indeterminate">
                    </mat-progress-spinner>
                </div>
            </section>
            
            <button matTooltip="Change Status" class="edit-order-status-btn" (click)="openStatusDialog()" mat-mini-fab>
                <mat-icon>swap_vert</mat-icon>
            </button>
            <button matTooltip="Prices" class="edit-order-prices-btn" (click)="openPricesDialog()" mat-mini-fab>
                <mat-icon>attach_money</mat-icon>
            </button>
            <button matTooltip="Print" class="edit-order-print-btn" (click)="openPrintDialog()" mat-mini-fab>
                <mat-icon>print</mat-icon>
            </button>
            <button matTooltip="Delete Order" class="edit-order-delete-btn" (click)="openDeleteDialog()" mat-mini-fab>
                <mat-icon>delete</mat-icon>
            </button>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button class="edit-order-add-stair-btn" (click)="addStair()" mat-mini-fab>
                <mat-icon>add_2</mat-icon>
            </button>
            <button mat-button (click)="close()">Cancel</button>
            <button mat-button (click)="edit()">Edit</button>
        </mat-dialog-actions>
    `,
    imports: [
        CommonModule,
        MatTableModule,
        MatDialogModule, 
        MatButtonModule,
        MatFormFieldModule, 
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,   
    ],
    styleUrls: ['./edit-order.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOrderDialogComponent implements OnInit {
    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    ordersService = inject(OrdersService);
    salesOrders: any[] = [];
    orders: any[] = [];
    updatedStatus: string = '';
    stairsCount = 0;

    getLoading(): Observable<boolean> {
        return this.loading$;
    }

    displayedColumns: string[] = [
        'Stair',
        'Location',
        'SectionDesc',
        'Width',
        'Height',
        'RiseOfStair',
        'OSM',
        'headroomlength',
        'StairRun',
        'OrderType',
    ];

    editOrderForm = new FormGroup({
        number: new FormControl(0),
        customer: new FormControl(''),
        billingAddress: new FormControl(''),
        address: new FormControl(''),
        model: new FormControl(0),
        orderDate: new FormControl(0),
        deliveryDate: new FormControl('')
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: IOrder,
        public dialogRef: MatDialogRef<any>
    ) {
        this.editOrderForm = new FormGroup({
            number: new FormControl(data.OrderNum),
            customer: new FormControl({
                value: data.Customer.toString(),
                disabled: true
            }),
            billingAddress: new FormControl(data.BillingAddress),
            address: new FormControl({
                value: data.Address,
                disabled: true
            }),
            model: new FormControl({
                value: data.Model,
                disabled: true
            }),
            orderDate: new FormControl(data.OrderDate),
            deliveryDate: new FormControl({
                value: data.DeliveryDate,
                disabled: true
            })
        });
    }

    ngOnInit() {
        this.getOrders();
    }

    edit() {
        this.updatedStatus = 'deleted';
        console.log('--DEBUG-- dialog edit order');

        this.dialogRef.close(this.updatedStatus);
    }

    close() {
        this.dialogRef.close(this.updatedStatus);
    }

    async getOrders() {
        this.loading$.next(true);

        const orders: {
            data: any[];
            total: number;
        } = await this.ordersService.getOrdersByOrderNumber(this.data.OrderNum);

        const salesOrders: {
            data: any[];
            total: number;
        } = await this.ordersService.getSalesOrdersByOrderNumber(this.data.OrderNum);

        if (!orders?.data || !orders?.data.length) {
            return this.dialogRef.close();
        }

        this.stairsCount = orders?.data.length;

        for (let i = 0; i < orders.data.length; i++) {
            if (orders.data[i]['WinderLocation']) {
                orders.data[i]['Location'] = orders.data[i]['WinderLocation'];
            }

            orders.data[i].Stair = i + 1;
        }
        console.log('--DEBUG-- dialog get orders!', orders.data);

        this.loading$.next(false);
        this.dataSource.connect().next(orders.data);
        this.orders = orders.data;
        this.salesOrders = salesOrders.data;
    }

    open(order:any) {
        console.log('--DEBUG-- dialog get one order', order);
        let stairCount = 0;

        const dialogRef = this.dialog.open(OrderDetailsComponent, {
            data: {
                ...order,
                stairsCount: this.stairsCount,
                stairs: this.orders.map(o => {
                    stairCount++;

                    return {
                        ID: o.ID,
                        Number: stairCount
                    };
                }).filter(o => o.ID !== order.ID),
                quote: this.data.quote
            },
            panelClass: 'stair-detail-dialog'
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (['deleted','updated'].includes(result)) {
                this.getOrders();
            }

            if (result === 'reopen') {
                
                await this.getOrders();

                let updatedOrder = this.orders.find((o: any) => {
                    return o.ID === order.ID;
                });

                console.log('--DEBUG-- updatedOrder: ', updatedOrder);

                this.open(updatedOrder);
            }
        });
    }

    openStatusDialog() {
        console.log('--DEBUG-- status dialog opened: ', this.data);
        
        const dialogRef = this.dialog.open(OrderStatus, {
            data: {
                orderNum: this.data.OrderNum,
                status: this.data.ShipStatus
            }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            console.log(`--DEBUG-- status dialog result: ${result}`);

            if (result) {
                this.data.ShipStatus = result;

                await this.ordersService.updateShipStatus(
                    this.data.OrderNum,
                    result
                );

                this.updatedStatus = 'updated';

                this.getOrders();
            }
        });
    }

    openPricesDialog() {
        console.log('--DEBUG-- prices dialog opened: ', this.data);
        
        const dialogRef = this.dialog.open(OrderPricesComponent, {
            data: {
                orderNum: this.data.OrderNum
            }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            console.log(`--DEBUG-- prices dialog result: ${result}`);
        });
    }

    openPrintDialog() {
        console.log('--DEBUG-- print dialog opened: ', this.data);
        const dialogRef = this.dialog.open(PrintOrderComponent, {
            data: {
                salesOrders: this.salesOrders,
                orders: this.orders,
                data: this.data,
                quote: this.data.quote
            }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            console.log(`--DEBUG-- print dialog result: ${result}`);
        });
    }

    openDeleteDialog() {
        console.log('--DEBUG-- delete dialog opened: ', this.data);
        const dialogRef = this.dialog.open(DeleteOrderDialogComponent, {
            data: {
                ID: this.data.OrderNum,
            }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            console.log(`--DEBUG-- delete dialog result: ${result}`);

            if (result) {
                await this.ordersService.deleteOrder(
                    this.data.OrderNum, 
                );

                this.dialogRef.close('deleted');
            }
        });
    }

    async addStair() {
        const order = this.orders[this.orders.length - 1];
        console.log('--DEBUG-- add stair');

        await this.ordersService.addStair({
            "id": order.ID,
            "orderNum": this.data.OrderNum,
        });

        this.getOrders();
    }
}