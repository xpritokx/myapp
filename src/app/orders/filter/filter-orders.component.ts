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
    selector: 'dialog-filter-orders',
    template: `
        <h2 mat-dialog-title>Choose params for filter</h2>
        <mat-dialog-content class="mat-typography text-area">
            <div class="order-inputs">
                <form [formGroup]="filterOrderForm">
                    <div class="search-by-date">
                        <h3>Choose date range for selected field</h3>
                        <mat-form-field class="example-form-field">
                            <mat-label>Enter a date range</mat-label>
                            <mat-date-range-input [rangePicker]="rangePicker">
                                <input formControlName="dateFrom" matStartDate placeholder="Start date" />
                                <input formControlName="dateTo" matEndDate placeholder="End date" />
                            </mat-date-range-input>
                            <mat-hint>MM/DD/YYYY – MM/DD/YYYY</mat-hint>
                            <mat-datepicker-toggle matIconSuffix [for]="rangePicker"></mat-datepicker-toggle>
                            <mat-date-range-picker #rangePicker>
                                <mat-date-range-picker-actions>
                                    <button mat-button matDateRangePickerCancel>Cancel</button>
                                    <button mat-raised-button matDateRangePickerApply>Apply</button>
                                </mat-date-range-picker-actions>
                            </mat-date-range-picker>
                        </mat-form-field>
                        <mat-form-field>
                            <mat-label>Date filter field</mat-label>
                            <select matNativeControl 
                                [ngModelOptions]="{standalone: true}"
                                [(ngModel)]="selectedDateField" 
                                name="dateField"
                            >
                                <option value="" selected></option>
                                @for (datePickerField of datePickerFields; track datePickerField) {
                                    <option [value]="datePickerField.value">{{datePickerField.viewValue}}</option>
                                }
                            </select>
                        </mat-form-field>
                    </div>
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
    styleUrls: ['./filter-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterOrdersDialogComponent {
    selectedField: string = 'not-selected';
    selectedDateField: string = 'not-selected';

    filterOrderForm = new FormGroup({
        searchInput: new FormControl(''),
        dateFrom: new FormControl(''),
        dateTo: new FormControl('')
    });

    datePickerFields: any[] = [
        {value: 'not-selected', viewValue: 'Not selected'},
        {value: 'OrderDate', viewValue: 'Order Date'},
        {value: 'DeliveryDate', viewValue: 'Delivery Date'},
        {value: 'ShipDate', viewValue: 'Shipping Date'},
    ];

    searchFields: any[] = [
        {value: 'not-selected', viewValue: 'Not selected'},
        {value: 'OrderNum', viewValue: 'Order Num'},
        {value: 'Customer', viewValue: 'Customer'},
        {value: 'Address', viewValue: 'Address'},
        {value: 'JobNum', viewValue: 'Job'},
        {value: 'PONum', viewValue: 'PO#'},
        {value: 'Model', viewValue: 'Model'},
        {value: 'Status', viewValue: 'Status'},
        {value: 'Comment', viewValue: 'Comment'},
        {value: 'InputBy', viewValue: 'Input By'}
    ];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {ID: string},
        public dialogRef: MatDialogRef<FilterOrdersDialogComponent>,
    ) {
    }

    search() {
        this.dialogRef.close({
            search: this.filterOrderForm.get('searchInput')?.value,
            searchField: this.selectedField,
            dateFrom: new Date(this.filterOrderForm.get('dateFrom')?.value || '').toDateString(),
            dateTo: new Date(this.filterOrderForm.get('dateTo')?.value || '').toDateString(),
            searchDateField: this.selectedDateField
        });
    };
}