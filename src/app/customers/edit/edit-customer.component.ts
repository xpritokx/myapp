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
import { Observable, BehaviorSubject } from 'rxjs';

import { ICustomer } from '../../../interfaces/customer.interface';

import { ErrorDialogWindow } from '../../error/error-dialog.component';

import { CustomersService } from '../../../services/customers.service';

@Component({
    selector: 'dialog-edit-customer',
    template: `
        <h2 mat-dialog-title>Edit Customer: {{ data.Name }}
            <span *ngIf="updatedLabel$ | async" id="customer-updated-label">Updated</span>
        </h2>
        
        <mat-dialog-content class="mat-typography">
            <section class="work-customer">
                <form class="form-customer" [formGroup]="editCustomerForm">
                    <mat-form-field class="full-width customer-name">
                        <mat-label for="name">Name</mat-label>
                        <input id="name" [disabled]="true" matInput type="text" formControlName="name" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="full-width customer-address">
                        <mat-label for="address">Address</mat-label>
                        <input id="address" matInput type="text" formControlName="address" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="full-width customer-comments">
                        <mat-label for="comments">Comments</mat-label>
                        <textarea id="comments" formControlName="comments" matInput></textarea>
                    </mat-form-field>
                </form>
            </section>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="cancel()">Cancel</button>
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
        MatProgressSpinnerModule,
        ReactiveFormsModule,   
    ],
    styleUrls: ['./edit-customer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCustomerDialogComponent implements OnInit {
    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);
    public updatedLabel$ = new BehaviorSubject<boolean>(false);

    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    customersService = inject(CustomersService);
    customer: any;

    getLoading(): Observable<boolean> {
        return this.loading$;
    }

    displayedColumns: string[] = [
        'Name',
        'Address',
        'Comments'
    ];

    editCustomerForm = new FormGroup({
        name: new FormControl(''),
        address: new FormControl(''),
        comments: new FormControl('')
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ICustomer,
        public dialogRef: MatDialogRef<any>
    ) {
        this.customer = data;

        this.editCustomerForm = new FormGroup({
            name: new FormControl(data.Name),
            address: new FormControl(data.Address || ''),
            comments: new FormControl(data.Comments || '')
        });
    }

    ngOnInit() {}

    async edit() {
        try {
            await this.customersService.updateCustomer(this.data.ID, {
                name: this.editCustomerForm.get('name')?.value,
                address: this.editCustomerForm.get('address')?.value,
                comments: this.editCustomerForm.get('comments')?.value
            });
    
            this.updatedLabel$.next(true);
        } catch (err: any) {
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }

    cancel() {
        if (this.updatedLabel$.getValue()) {
            this.dialogRef.close('updated');
        } else {
            this.dialogRef.close();
        }
    }
}