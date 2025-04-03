import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { OrdersService } from '../../../services/orders.service';
import { QuotesService } from '../../../services/quotes.service';

import { SuccessDialogWindow } from '../../success/success-dialog.component';
import { ErrorDialogWindow } from '../../error/error-dialog.component';

@Component({
  selector: 'dialog-advanced',
  template: `
    <h2 mat-dialog-title>{{ data.quote ? "Quote" : "Order" }} # <strong>{{ data.orderNum }}</strong> make action:</h2>
    <mat-dialog-content class="mat-typography text-area">
        <div class="example-button-row">
            <div class="example-flex-container">
                <div class="example-button-container">
                    <button (click)="convert()" mat-fab extended>
                        <mat-icon>published_with_changes</mat-icon>
                        {{ data.quote ? "Convert to Workorder" : "Convert to Quote" }}
                    </button>
                    
                </div>
                <div class="example-button-container">
                    <button (click)="duplicate()" mat-fab extended>
                        <mat-icon>content_copy</mat-icon>
                        {{ data.quote ? "Duplicate Quote" : "Duplicate Order" }}
                    </button>
                </div>
            </div>
        </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./advanced.component.scss'],
  imports: [ 
    MatButtonModule, 
    MatDialogModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogAdvanced {
    ordersService = inject(OrdersService);
    quotesService = inject(QuotesService);

    dialog = inject(MatDialog);

    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        orderNum: string;
        quote: boolean;
    }, public dialogRef: MatDialogRef<any>) {}

    async convert() {
        let res: any;

        try {
            if (this.data.quote) {
                console.log('--DEBUG-- convert quote to order');

                res = await this.quotesService.convertQuoteIntoOrder(
                    Number(this.data.orderNum),
                    this.data.quote
                );
            } else {
                console.log('--DEBUG-- convert order to quote');

                res = await this.ordersService.convertOrderIntoQuote(
                    Number(this.data.orderNum),
                    this.data.quote
                );
            }
            
            console.log('--DEBUG-- converted: ', res);

            if (res?.status === 'ok') {
                this.dialog.open(SuccessDialogWindow, {
                    data: {
                        message: `Order (${this.data.orderNum}) was successfully converter into quote!`
                    }
                });

                this.dialogRef.close('updated');
            }
        } catch (err: any) {
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }

    async duplicate() {
        console.log('--DEBUG-- duplicate an order');
        let res: any;

        try {
            if (this.data.quote) {
                res = await this.quotesService.duplicateQuote(
                    Number(this.data.orderNum),
                    this.data.quote
                );
            } else {
                res = await this.ordersService.duplicateOrder(
                    Number(this.data.orderNum),
                    this.data.quote
                );
            }
            
            console.log('--DEBUG-- duplicate: ', res);

            if (res?.status === 'ok') {
                this.dialog.open(SuccessDialogWindow, {
                    data: {
                        message: `Order (${this.data.orderNum}) was successfully duplicated!`
                    }
                });
                this.dialogRef.close('updated');
            }
        } catch (err: any) {
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }
}