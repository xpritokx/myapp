import { ChangeDetectionStrategy, Inject, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'dialog-delete-stair',
  template: `
    <h2 mat-dialog-title>Are you sure?</h2>
    <mat-dialog-content class="mat-typography text-area">
        <p>Do you really want to delete "Stair #{{ data.ID }}"? This process can't be ondone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
        <button mat-button [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./delete-stair.component.scss'],
  imports: [ MatButtonModule, MatDialogModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteStairDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: {ID: string}) {}
}