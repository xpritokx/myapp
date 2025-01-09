import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IOrder } from '../../../interfaces/order.interface';

@Component({
    selector: 'dialog-edit-order',
    template: `
        <h2 mat-dialog-title>Order #{{ data.ID }}</h2>
        <mat-dialog-content class="mat-typography">
            <div class="order-inputs">
                <form [formGroup]="editOrderForm">
                    <mat-form-field class="order-number">
                        <mat-label for="number">Order number</mat-label>
                        <input id="number" matInput type="text" formControlName="number" placeholder="Ex. 27230" />
                    </mat-form-field>
                    <mat-form-field class="order-customer">
                        <mat-label for="customer">Customer</mat-label>
                        <input id="customer" matInput type="text" formControlName="customer" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="order-billing-address">
                        <mat-label for="billingAddress">Billing Address</mat-label>
                        <input id="billingAddress" matInput type="text" formControlName="billingAddress" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="order-customer">
                        <mat-label for="address">Address</mat-label>
                        <input id="address" matInput type="text" formControlName="address" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="order-customer">    
                        <mat-label for="model">Model</mat-label>
                        <input id="model" matInput type="text" formControlName="model" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="order-customer">    
                        <mat-label for="stairsNum">Stairs number</mat-label>
                        <input id="stairsNum" matInput type="text" formControlName="stairsNum" placeholder="Ex. 4" />
                    </mat-form-field>

                    <mat-form-field class="order-customer">
                        <mat-label for="orderDate">Order date</mat-label>
                        <input id="orderDate" matInput type="text" formControlName="orderDate" placeholder="Ex. 40168.285156" />
                    </mat-form-field>
                        
                    <mat-form-field class="order-customer">
                        <mat-label for="deliveryDate">Delivery date</mat-label>
                        <input id="deliveryDate" matInput type="text" formControlName="deliveryDate" placeholder="Ex. Base, Low, Mid" />
                    </mat-form-field>

                    <mat-form-field class="order-customer">
                        <mat-label for="height">Height</mat-label>
                        <input id="height" matInput type="text" formControlName="height" placeholder="Ex. 99.375" />
                    </mat-form-field>

                    <mat-form-field class="order-customer">    
                        <mat-label for="width">Width</mat-label>
                        <input id="width" matInput type="text" formControlName="width" placeholder="Ex. 41.25" />
                    </mat-form-field>
                </form>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancel</button>
            <button mat-button (click)="edit()">Edit</button>
        </mat-dialog-actions>
    `,
    imports: [
        MatButtonModule,
        MatDialogModule, 
        ReactiveFormsModule, 
        MatFormFieldModule, 
        MatInputModule 
    ],
    styleUrls: ['./edit-order.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOrderDialogComponent {
    editOrderForm = new FormGroup({
        number: new FormControl(0),
        customer: new FormControl(0),
        billingAddress: new FormControl(''),
        address: new FormControl(''),
        model: new FormControl(0),
        stairsNum: new FormControl(0),
        orderDate: new FormControl(0),
        deliveryDate: new FormControl(''),
        height: new FormControl(0),
        width: new FormControl(0)
    });

    constructor(@Inject(MAT_DIALOG_DATA) public data: IOrder) {
        this.editOrderForm = new FormGroup({
            number: new FormControl(data.OrderNum),
            customer: new FormControl(data.Customer),
            billingAddress: new FormControl(data.BillingAddress),
            address: new FormControl(data.Address),
            model: new FormControl(data.Model),
            stairsNum: new FormControl(data.StairsNum),
            orderDate: new FormControl(data.OrderDate),
            deliveryDate: new FormControl(data.DeliveryDate),
            height: new FormControl(data.Height),
            width: new FormControl(data.Width)
        });
    }

    edit() {
        console.log('--DEBUG-- dialog edit!');
    }
}