import { ChangeDetectionStrategy, Inject, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'dialog-delete-customer',
  template: `
    <h2 mat-dialog-title>Error</h2>
    <mat-dialog-content class="mat-typography error-message-data">
        <p>{{ data.errorMessage }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./error-dialog.component.scss'],
  imports: [ MatButtonModule, MatDialogModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDialogWindow {
    constructor(@Inject(MAT_DIALOG_DATA) public data: {errorMessage: string}) {
        
    }
}