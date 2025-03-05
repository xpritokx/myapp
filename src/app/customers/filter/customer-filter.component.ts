import { ChangeDetectionStrategy, Inject, Component } from '@angular/core';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
    selector: 'dialog-filter-customers',
    template: `
        <h2 mat-dialog-title>Choose params for filter</h2>
        <mat-dialog-content class="mat-typography text-area">
            <div class="order-inputs">
                <form [formGroup]="filterCustomerForm">
                    <div class="search-by-field">
                        <h3> Search by selected field</h3>
                        <mat-form-field [style.width.px]=260 class="order-number">
                            <mat-label for="searchInput">Search input</mat-label>
                            <input id="searchInput" matInput type="text" formControlName="searchInput" placeholder="Ex. 27230" />
                        </mat-form-field>
                        <mat-form-field>
                            <mat-label>Search field</mat-label>
                                <select matNativeControl 
                                    [ngModelOptions]="{standalone: true}"
                                    [(ngModel)]="selectedField" 
                                    name="dateField"
                                >
                                    <option value="" selected></option>
                                    @for (searchField of searchFields; track searchField) {
                                        <option [value]="searchField.value">{{searchField.viewValue}}</option>
                                    }
                                </select>
                        </mat-form-field>
                    </div>
                </form>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancel</button>
            <button mat-button (click)="search()">Search</button>
        </mat-dialog-actions>
    `,
    imports: [
        FormsModule,
        MatButtonModule,
        MatDialogModule, 
        ReactiveFormsModule, 
        MatFormFieldModule, 
        MatInputModule,
        MatDatepickerModule,
        MatSelectModule
    ],
    providers: [provideNativeDateAdapter()],
    styleUrls: ['./customer-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterCustomersDialogComponent {
    selectedField: string = 'not-selected';

    filterCustomerForm = new FormGroup({
        searchInput: new FormControl(''),
    });

    searchFields: any[] = [
        {value: 'not-selected', viewValue: 'Not selected'},
        {value: 'Name', viewValue: 'Name'},
        {value: 'Address', viewValue: 'Address'},
        {value: 'Comments', viewValue: 'Comments'}
    ];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {ID: string},
        public dialogRef: MatDialogRef<FilterCustomersDialogComponent>,
    ) {
    }

    search() {
        this.dialogRef.close({
            search: this.filterCustomerForm.get('searchInput')?.value,
            searchField: this.selectedField,
        });
    };
}