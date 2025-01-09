import { ChangeDetectionStrategy, Inject, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'dialog-filter-orders',
  template: `
    <h2 mat-dialog-title>Choose params for filter</h2>
    <mat-dialog-content class="mat-typography text-area">
        
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-button [mat-dialog-close]="true">Search</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./filter-orders.component.scss'],
  imports: [ MatButtonModule, MatDialogModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterOrdersDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: {ID: string}) { }
}