import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule  } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { IOrder } from '../../../interfaces/order.interface';

import { CustomersService } from '../../../services/customers.service';
import { ModelsService } from '../../../services/models.service';
import { OrdersService } from '../../../services/orders.service';

@Component({
    selector: 'dialog-add-order',
    template: `
        <h2 mat-dialog-title class="mat-dialog-title">New Order</h2>
        <mat-dialog-content class="mat-typography">
            <section *ngIf="!(loading$ | async)" class="create-orders-form">
                <form [formGroup]="orderCreateForm">
                    <div class="create-order-quote">
                        <mat-checkbox id="quote" color="primary"
                            formControlName="quote">Quote</mat-checkbox>
                    </div>

                    <mat-form-field class="create-order-customer full-width">
                        <mat-label>Customer</mat-label>
                        <input type="text"
                            placeholder="Pick one"
                            aria-label="Customer"
                            matInput
                            [formControl]="customer"
                            [matAutocomplete]="auto1">
                        <mat-autocomplete #auto1="matAutocomplete">
                            @for (customerOption of filteredCustomersOptions | async; track customerOption.viewValue) {
                                <mat-option [value]="customerOption">{{ customerOption.viewValue }}</mat-option>
                            }
                        </mat-autocomplete>
                    </mat-form-field>

                    <mat-form-field class="create-order-delivery-address">
                        <mat-label for="deliveryAddress">Delivery Address</mat-label>
                        <input id="deliveryAddress" matInput type="text" formControlName="deliveryAddress" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="create-order-billing-address">
                        <mat-label for="billingAddress">Billing Address</mat-label>
                        <input id="billingAddress" matInput type="text" formControlName="billingAddress" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="create-order-model full-width">
                        <mat-label>Model</mat-label>
                        <input type="text"
                            placeholder="Pick one"
                            aria-label="Model"
                            matInput
                            [formControl]="model"
                            [matAutocomplete]="auto2">
                        <mat-autocomplete #auto2="matAutocomplete">
                            @for (modelOption of filteredModelsOptions | async; track modelOption.viewValue) {
                                <mat-option [value]="modelOption">{{ modelOption.viewValue }}</mat-option>
                            }
                        </mat-autocomplete>
                    </mat-form-field>

                    <mat-form-field>
                        <mat-label for="deliveryDate">Delivery date</mat-label>
                        <input id="deliveryDate" matInput formControlName="deliveryDate" [matDatepicker]="picker">
                        <mat-hint>MM/DD/YYYY</mat-hint>
                        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                    </mat-form-field>

                    <mat-form-field class="create-order-job-number">
                        <mat-label for="job">Job #</mat-label>
                        <input id="job" matInput type="text" formControlName="job" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="create-order-po-number">
                        <mat-label for="po">PO</mat-label>
                        <input id="po" matInput type="text" formControlName="po" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="create-order-number-of-stairs">
                        <mat-label for="numbersOfStairs"># of Stairs</mat-label>
                        <input id="numbersOfStairs" matInput type="text" formControlName="numbersOfStairs" placeholder="Ex. 27230" />
                    </mat-form-field>

                    <mat-form-field class="create-order-po-number">
                        <mat-label for="input">Input</mat-label>
                        <input id="input" matInput type="text" formControlName="input" placeholder="Ex. 27230" />
                    </mat-form-field>
                </form>
            </section>
            <div *ngIf="loading$ | async" class="spinning-loader" style="display: flex; justify-content: center; align-items: center; background: white;">
                <mat-progress-spinner
                    color="primary" 
                    mode="indeterminate">
                </mat-progress-spinner>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancel</button>
            <button mat-button (click)="add()">Add</button>
        </mat-dialog-actions>
    `,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatDialogModule, 
        MatButtonModule,
        MatFormFieldModule, 
        MatInputModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
    ],
    styleUrls: ['./add-order.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddOrderDialogComponent implements OnInit {
    public loading$ = new BehaviorSubject<boolean>(false);
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    customersService = inject(CustomersService);
    ordersService = inject(OrdersService);
    modelsService = inject(ModelsService);

    customersForSelect: {
        value: number,
        viewValue: string
    }[] = [];

    modelsForSelect: {
        value: number,
        viewValue: string
    }[] = [];

    filteredCustomersOptions: Observable<any[]> | undefined;
    filteredModelsOptions: Observable<any[]> | undefined;

    selectedCustomer: string = '';
    selectedModel: string = '';

    customer = new FormControl('');
    customerID = 0;
    model = new FormControl('');

    orderCreateForm = new FormGroup({
        quote: new FormControl(false),
        deliveryAddress: new FormControl(''),
        billingAddress: new FormControl(''),
        deliveryDate: new FormControl(''),
        job: new FormControl(''),
        po: new FormControl(''),
        numbersOfStairs: new FormControl(0),
        input: new FormControl('Human')
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: IOrder,
        public dialogRef: MatDialogRef<any>
    ) {}

    ngOnInit() {
        Promise.all([
            this.getCustomers(),
            this.getModels()
        ]).then(result => {
            this.filteredModelsOptions = this.model.valueChanges.pipe(
                startWith(''),
                map(value => this._filterModels(value || '')),
            );
    
            this.filteredCustomersOptions = this.customer.valueChanges.pipe(
                startWith(''),
                map(value => this._filterCustomers(value || '')),
            );
        });
    }

    private _filterCustomers(value: any): any[] {
        let filterValue = '';
        
        if (value?.viewValue) {
            filterValue = value?.viewValue?.toLowerCase();
            this.customerID = value?.value;
        } else if (value) {
            filterValue = value.toLowerCase();
        }

        let filterResult = this.customersForSelect.filter(option => option.viewValue.toLowerCase().includes(filterValue));
        if (typeof this.customer.value === 'object') {
            let customerValue: any = this.customer.value;

            this.customer.setValue(customerValue?.viewValue || '')
        }

        return filterResult;
    }

    private _filterModels(value: any): any[] {
        console.log('--DEBUG-- filter models: ', value);
        let filterValue = '';
        
        if (value?.viewValue) {
            filterValue = value?.viewValue?.toLowerCase();
        } else if (value) {
            filterValue = value.toLowerCase();
        }

        let filterResult = this.modelsForSelect.filter(option => option.viewValue.toLowerCase().includes(filterValue));
        if (typeof this.model.value === 'object') {
            let modelValue: any = this.model.value;

            this.model.setValue(modelValue?.viewValue || '')
        }

        return filterResult;
    }

    async getCustomers() {
        this.loading$.next(true);

        const customers: {
            data: any[];
            total: number;
        } = await this.customersService.getCustomersByName('');

        this.customersForSelect = customers.data.map(customer => {
            return {
                value: customer.ID,
                viewValue: customer.Name
            }
        });

        this.loading$.next(false);
    }

    async getModels() {
        this.loading$.next(true);

        const models: {
            data: any[];
            total: number;
        } = await this.modelsService.getModelsByName('');

        this.modelsForSelect = models.data.map(model => {
            return {
                value: model.ID,
                viewValue: model.Name
            }
        });

        this.loading$.next(false);
    }

    async add() {
        this.loading$.next(true);

        console.log('--DEBUG-- dialog add!', {
            "customer": this.customerID,
            "quote": this.orderCreateForm.get('quote')?.value,
            "deliveryAddress": this.orderCreateForm.get('deliveryAddress')?.value,
            "billingAddress": this.orderCreateForm.get('billingAddress')?.value,
            "deliveryDate": this.orderCreateForm.get('deliveryDate')?.value,
            "model": this.selectedModel,
            "jobNum": this.orderCreateForm.get('job')?.value,
            "po": this.orderCreateForm.get('po')?.value,
            "numOfStairs": this.orderCreateForm.get('numbersOfStairs')?.value,
            "input": this.orderCreateForm.get('input')?.value
        });

        let result = await this.ordersService.createOrder({
            "customer": this.customerID,
            "quote": this.orderCreateForm.get('quote')?.value,
            "deliveryAddress": this.orderCreateForm.get('deliveryAddress')?.value,
            "billingAddress": this.orderCreateForm.get('billingAddress')?.value,
            "deliveryDate": this.orderCreateForm.get('deliveryDate')?.value,
            "model": this.selectedModel,
            "jobNum": this.orderCreateForm.get('job')?.value,
            "po": this.orderCreateForm.get('po')?.value,
            "numOfStairs": this.orderCreateForm.get('numbersOfStairs')?.value,
            "input": this.orderCreateForm.get('input')?.value
        });

        this.loading$.next(false);

        this.dialogRef.close(result);
    }
}