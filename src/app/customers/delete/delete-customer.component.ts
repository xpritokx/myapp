import { ChangeDetectionStrategy, Inject, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'dialog-delete-customer',
  template: `
    <h2 mat-dialog-title>Are you sure?</h2>
    <mat-dialog-content class="mat-typography text-area">
        <p>Do you really want to delete customer: "{{ data.Name }}"? This process can't be ondone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
        <button mat-button [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./delete-customer.component.scss'],
  imports: [ MatButtonModule, MatDialogModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteCustomerDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: {ID: string, Name: string}) {}
}