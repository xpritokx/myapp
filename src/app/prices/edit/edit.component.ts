import { ChangeDetectionStrategy, inject, Inject, Component } from '@angular/core';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { PricesService } from '../../../services/prices.service';
import { ErrorDialogWindow } from '../../error/error-dialog.component';

@Component({
  selector: 'edit-price',
  template: `
    <h2 mat-dialog-title>Change price for <strong>{{data.PriceCode}}</strong></h2>
    <mat-dialog-content class="mat-typography text-area">
    <form class="form-user-price" [formGroup]="editPriceForm">
        <mat-form-field class="unit-price">
            <mat-label for="unitPrice">Unit Price</mat-label>
            <input id="unitPrice" matInput type="text" formControlName="unitPrice" placeholder="Ex. 1'Ply" />
        </mat-form-field>
    </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
        <button mat-button (click)="edit()">Change</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./edit.component.scss'],
  imports: [ 
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPriceComponent {
    readonly dialog = inject(MatDialog);

    editPriceForm = new FormGroup({
        unitPrice: new FormControl(0)
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {PriceCode: number, UnitPrice: number, ID: number},
        public dialogRef: MatDialogRef<any>
    ) {
        this.editPriceForm.get('unitPrice')?.setValue(data.UnitPrice);
    }

    pricesService = inject(PricesService);

    async edit() {
        console.log('--DEBUG-- price changing: ', this.editPriceForm.get('unitPrice'));

        try {
            await this.pricesService.editPrice(this.data.ID, this.editPriceForm.get('unitPrice')?.value as number);
        
            this.dialogRef.close('changed');
        } catch(err: any) {
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }

        
    }
}