import { ChangeDetectionStrategy, Inject, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'success-operation-dialog',
  template: `
    <h2 mat-dialog-title>Success!</h2>
    <mat-dialog-content class="mat-typography success-message-data">
        <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./success-dialog.component.scss'],
  imports: [ MatButtonModule, MatDialogModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessDialogWindow {
    constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string}) {
        
    }
}