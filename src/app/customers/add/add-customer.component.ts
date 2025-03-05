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

import { ErrorDialogWindow } from '../../error/error-dialog.component';

import { CustomersService } from '../../../services/customers.service';

@Component({
    selector: 'dialog-add-customer',
    template: `
        <h2 mat-dialog-title>Create Customer</h2>
        
        <mat-dialog-content class="mat-typography">
            <section class="work-customer">
                <form class="form-customer" [formGroup]="createCustomerForm">
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
            <button mat-button (click)="save()">Save</button>
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
    styleUrls: ['./add-customer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCustomerDialogComponent implements OnInit {
    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);

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

    createCustomerForm = new FormGroup({
        name: new FormControl(''),
        address: new FormControl(''),
        comments: new FormControl('')
    });

    constructor(
        public dialogRef: MatDialogRef<any>
    ) {
        this.createCustomerForm = new FormGroup({
            name: new FormControl(''),
            address: new FormControl(''),
            comments: new FormControl('')
        });
    }

    ngOnInit() {}

    async save() {
        try {
            let cstmr: any = await this.customersService.addCustomer({
                name: this.createCustomerForm.get('name')?.value,
                address: this.createCustomerForm.get('address')?.value,
                comments: this.createCustomerForm.get('comments')?.value
            });

            this.dialogRef.close({
                status: 'updated',
                id: cstmr.id,
                name: cstmr.name
            });
        } catch (err: any) {
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}