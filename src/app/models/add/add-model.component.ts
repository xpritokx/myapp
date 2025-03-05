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

import { IModels } from '../../../interfaces/models.interface';

import { ErrorDialogWindow } from '../../error/error-dialog.component';

import { ModelsService } from '../../../services/models.service';
@Component({
    selector: 'dialog-add-customer',
    template: `
        <h2 mat-dialog-title>Create Model</h2>
        
        <mat-dialog-content class="mat-typography">
            <section class="work-model">
                <form class="form-model" [formGroup]="createModelForm">
                    <mat-form-field class="full-width model-name">
                        <mat-label for="name">Name</mat-label>
                        <input id="name" [disabled]="true" matInput type="text" formControlName="name" placeholder="Ex. 27230" />
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
    styleUrls: ['./add-model.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateModelDialogComponent implements OnInit {
    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);
    workorderNum: number;
    customerID: number;

    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    modelsService = inject(ModelsService);
    model: any;

    getLoading(): Observable<boolean> {
        return this.loading$;
    }

    displayedColumns: string[] = [
        'Name'
    ];

    createModelForm = new FormGroup({
        name: new FormControl('')
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<any>
    ) {
        this.createModelForm = new FormGroup({
            name: new FormControl('')
        });

        console.log('--DEBUG-- add model data: ', data);
        this.workorderNum = data.workorderNum;
        this.customerID = data.customerID;
    }

    ngOnInit() {}

    async save() {
        try {
            let mdl:any = await this.modelsService.addModel({
                name: this.createModelForm.get('name')?.value || '',
                workorder: this.workorderNum || 0,
                customer: this.customerID || 0
            });
    
            this.dialogRef.close({
                status: 'updated',
                id: mdl.id,
                name: mdl.name
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