import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'dialog-change-status',
  template: `
    <h2 mat-dialog-title>Order # <strong>{{ data.orderNum }}</strong> current status: <strong>{{ data.status }}</strong></h2>
    <mat-dialog-content class="mat-typography text-area">
        <mat-form-field>
            <mat-label>Order Status</mat-label>
            <select matNativeControl 
                [ngModelOptions]="{standalone: true}"
                [(ngModel)]="orderStatusesField" 
                name="dateField"
            >
                <option value="" selected></option>
                @for (orderStatus of orderStatuses; track orderStatus) {
                    <option [value]="orderStatus.value">{{orderStatus.viewValue}}</option>
                }
            </select>
        </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
        <button mat-button (click)="change()">Change</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./order-status.component.scss'],
  imports: [ 
    MatButtonModule, 
    MatDialogModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatus {
    orderStatusesField:string = '';
    orderStatuses: any = [{
        value: 'Loaded',
        viewValue: 'Loaded' 
    },
    {
        value: 'Unloaded',
        viewValue: 'Unloaded' 
    },
    {
        value: 'Delivered',
        viewValue: 'Delivered' 
    },
    {
        value: 'Picked Up',
        viewValue: 'Picked Up' 
    }];

    orderStatus: any;

    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        orderNum: string;
        status: string;
    }, public dialogRef: MatDialogRef<any>) {
        this.orderStatus = data;

        console.log('--DEBUG-- order st. ', this.orderStatus.status);
        this.orderStatusesField = this.orderStatus.status === 'Not Shipped' ? 'Unloaded' : this.orderStatus.status;
    }

    change() {
        console.log('--DEBUG-- change ship status: ', this.orderStatusesField);

        if (this.orderStatus.status !== this.orderStatusesField) {
            return this.dialogRef.close(this.orderStatusesField);
        }

        this.dialogRef.close(false);
    }
}