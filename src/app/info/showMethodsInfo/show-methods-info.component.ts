import { ChangeDetectionStrategy, Inject, Component } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'dialog-delete-customer',
  template: `
    <h2 mat-dialog-title>Methods Info</h2>
    <mat-dialog-content class="mat-typography error-message-data">
    <section class="list-orders">
        <table mat-table [dataSource]="dataSourceCommon" class="mat-elevation-z8 table-content">
            <ng-container matColumnDef="Method Name" stickyEnd>
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element"> {{element[0]}} </td>
            </ng-container>
            <ng-container matColumnDef="Method A">
                <th mat-header-cell *matHeaderCellDef> Method A </th>
                <td mat-cell *matCellDef="let element"> {{element[1]}} </td>
            </ng-container>
            <ng-container matColumnDef="Method B">
                <th mat-header-cell *matHeaderCellDef> Method B </th>
                <td mat-cell *matCellDef="let element"> {{element[2]}} </td>
            </ng-container>
            <ng-container matColumnDef="Method C">
                <th mat-header-cell *matHeaderCellDef> Method C </th>
                <td mat-cell *matCellDef="let element"> {{element[3]}} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class='subsection-title'><strong>CUT LIST</strong></div>
        <table mat-table [dataSource]="dataSourceCutList" class="mat-elevation-z8 table-content">
            <ng-container matColumnDef="Method Name" stickyEnd>
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element"> {{element[0]}} </td>
            </ng-container>
            <ng-container matColumnDef="Method A">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element"> {{element[1]}} </td>
            </ng-container>
            <ng-container matColumnDef="Method B">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element"> {{element[2]}} </td>
            </ng-container>
            <ng-container matColumnDef="Method C">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element"> {{element[3]}} </td>
            </ng-container>
          
            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class='subsection-title'><strong>MATERIALS</strong></div>
        <table mat-table [dataSource]="dataSourceMaterials" class="mat-elevation-z8 table-content">
            <ng-container matColumnDef="Method Name" stickyEnd>
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element"> {{element[0]}} </td>
            </ng-container>
            <ng-container matColumnDef="Method A">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element"> {{element[1]}} </td>
            </ng-container>
            <ng-container matColumnDef="Method B">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element"> {{element[2]}} </td>
            </ng-container>
            <ng-container matColumnDef="Method C">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let element"> {{element[3]}} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
    </section>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./show-methods-info.component.scss'],
  imports: [ 
      MatButtonModule, 
      MatDialogModule,
      MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowMethodsInfoDialog {
    dataSourceCommon: MatTableDataSource<any> = new MatTableDataSource();
    dataSourceCutList: MatTableDataSource<any> = new MatTableDataSource();
    dataSourceMaterials: MatTableDataSource<any> = new MatTableDataSource();

    displayedColumns: string[] = [
      'Method Name',
      'Method A',
      'Method B',
      'Method C'
    ];

    dataColumnsCommon: any[] = [
      ['# of Risers', 0, 0, 0],
      ['Rise of Stair', 0, 0, 0],
      ['New Height (strcs)', 0, 0, 0],
      ['Height Difference', 0, 0, 0],
      ['Stair Run', -3, -3, -3],
      ['Tread Run', -2, -2, -2],
    ];

    dataColumnsCutList: any[] = [
      ['Tread Width', -3.625, -3.625, -3.625],
      ['Riser Width', -3.625, -3.625, -3.625],
      ['# of Std Risers', 0, 0, 0],
      ['# of Treads', -1, -1, -1],
      ['Bottom Riser (rise)', -1, -1, -1],
      ['Adjusted Bottom Rise', -1, -1, -1],
      ['Top Riser (rise)', 1, 1, 1],
      ['Adjusted Top Rise', 1, 1, 1],
      ['Top Riser (width)', -1.5, -1.5, -1.5],
      ['Adjusted Height', 0, 0, 0],
    ];

    dataColumnsMaterials: any[] = [
      ['1" Material', 0, 0, 0],
      ['1/2" Material', 0, 0, 0],
      ['2x10', 0, 0, 0],
      ['2x6', 0, 0, 0],
      ['2x12', 0, 0, -1.5],
    ];

    constructor(@Inject(MAT_DIALOG_DATA) public data: any = {}) {
      this.dataColumnsCommon = this.calculateMethodsValues(this.dataColumnsCommon, data, 'common');
      this.dataColumnsCutList = this.calculateMethodsValues(this.dataColumnsCutList, data, 'cutList');
      this.dataColumnsMaterials = this.calculateMethodsValues(this.dataColumnsMaterials, data, 'materials');

      this.dataSourceCommon.connect().next(this.dataColumnsCommon);
      this.dataSourceCutList.connect().next(this.dataColumnsCutList);
      this.dataSourceMaterials.connect().next(this.dataColumnsMaterials);
    }

    calculateMethodsValues(dataColumns: any, data: any, section: string) {
      return dataColumns.map((dataColumn: any) =>  {
        let valueName:string = dataColumn[0];
        console.log('--DEBUG-- section: ', section);
        

        switch (section) {
          case 'common': {
            if (valueName === '# of Risers') {
              dataColumn[1] = data?.method1['# of Risers'] || dataColumn[1];
              dataColumn[2] = data?.method2['# of Risers'] || dataColumn[2];
              dataColumn[3] = data?.method3['# of Risers'] || dataColumn[3];
            }
    
            if (valueName === 'Rise of Stair') {
              dataColumn[1] = data?.method1['Rise of Stair'] || dataColumn[1];
              dataColumn[2] = data?.method2['Rise of Stair'] || dataColumn[2];
              dataColumn[3] = data?.method3['Rise of Stair'] || dataColumn[3];
            }
    
            if (valueName === 'New Height (strcs)') {
              dataColumn[1] = data?.method1['New Height (strcs)'] || dataColumn[1];
              dataColumn[2] = data?.method2['New Height (strcs)'] || dataColumn[2];
              dataColumn[3] = data?.method3['New Height (strcs)'] || dataColumn[3];
            }
    
            if (valueName === 'Height Difference') {
              dataColumn[1] = data?.method1['Height Difference'] || dataColumn[1];
              dataColumn[2] = data?.method2['Height Difference'] || dataColumn[2];
              dataColumn[3] = data?.method3['Height Difference'] || dataColumn[3];
            }
    
            if (valueName === 'Stair Run') {
              dataColumn[1] = data?.method1['Stair Run'] || dataColumn[1];
              dataColumn[2] = data?.method2['Stair Run'] || dataColumn[2];
              dataColumn[3] = data?.method3['Stair Run'] || dataColumn[3];
            }
    
            if (valueName === 'Tread Run') {
              dataColumn[1] = data?.method1['Tread Run'] || dataColumn[1];
              dataColumn[2] = data?.method2['Tread Run'] || dataColumn[2];
              dataColumn[3] = data?.method3['Tread Run'] || dataColumn[3];
            }

            break;
          }



          case 'cutList': {
            if (valueName === 'Tread Width') {
              dataColumn[1] = data?.method1['Tread Width'] || dataColumn[1];
              dataColumn[2] = data?.method2['Tread Width'] || dataColumn[2];
              dataColumn[3] = data?.method3['Tread Width'] || dataColumn[3];
            }
    
            if (valueName === 'Riser Width') {
              dataColumn[1] = data?.method1['Riser Width'] || dataColumn[1];
              dataColumn[2] = data?.method2['Riser Width'] || dataColumn[2];
              dataColumn[3] = data?.method3['Riser Width'] || dataColumn[3];
            }
    
            if (valueName === '# of Std Risers') {
              dataColumn[1] = data?.method1['# of Std Risers'] || dataColumn[1];
              dataColumn[2] = data?.method2['# of Std Risers'] || dataColumn[2];
              dataColumn[3] = data?.method3['# of Std Risers'] || dataColumn[3];
            }
    
            if (valueName === '# of Treads') {
              dataColumn[1] = data?.method1['# of Treads'] || dataColumn[1];
              dataColumn[2] = data?.method2['# of Treads'] || dataColumn[2];
              dataColumn[3] = data?.method3['# of Treads'] || dataColumn[3];
            }
    
            if (valueName === 'Bottom Riser (rise)') {
              dataColumn[1] = data?.method1['Bottom Riser (rise)'] || dataColumn[1];
              dataColumn[2] = data?.method2['Bottom Riser (rise)'] || dataColumn[2];
              dataColumn[3] = data?.method3['Bottom Riser (rise)'] || dataColumn[3];
            }
    
            if (valueName === 'Adjusted Bottom Rise') {
              dataColumn[1] = data?.method1['Adjusted Bottom Rise'] || dataColumn[1];
              dataColumn[2] = data?.method2['Adjusted Bottom Rise'] || dataColumn[2];
              dataColumn[3] = data?.method3['Adjusted Bottom Rise'] || dataColumn[3];
            }
    
            if (valueName === 'Top Riser (rise)') {
              dataColumn[1] = data?.method1['Top Riser (rise)'] || dataColumn[1];
              dataColumn[2] = data?.method2['Top Riser (rise)'] || dataColumn[2];
              dataColumn[3] = data?.method3['Top Riser (rise)'] || dataColumn[3];
            }
    
            if (valueName === 'Adjusted Top Rise') {
              dataColumn[1] = data?.method1['Adjusted Top Rise'] || dataColumn[1];
              dataColumn[2] = data?.method2['Adjusted Top Rise'] || dataColumn[2];
              dataColumn[3] = data?.method3['Adjusted Top Rise'] || dataColumn[3];
            }
    
            if (valueName === 'Top Riser (width)') {
              dataColumn[1] = data?.method1['Top Riser (width)'] || dataColumn[1];
              dataColumn[2] = data?.method2['Top Riser (width)'] || dataColumn[2];
              dataColumn[3] = data?.method3['Top Riser (width)'] || dataColumn[3];
            }
    
            if (valueName === 'Adjusted Height') {
              dataColumn[1] = data?.method1['Adjusted Height'] || dataColumn[1];
              dataColumn[2] = data?.method2['Adjusted Height'] || dataColumn[2];
              dataColumn[3] = data?.method3['Adjusted Height'] || dataColumn[3];
            }

            break;
          }

          case 'materials': {
            if (valueName === '1" Material') {
              dataColumn[1] = data?.method1['1" Material'] || dataColumn[1];
              dataColumn[2] = data?.method2['1" Material'] || dataColumn[2];
              dataColumn[3] = data?.method3['1" Material'] || dataColumn[3];
            }
    
            if (valueName === '1/2" Material') {
              dataColumn[1] = data?.method1['1/2" Material'] || dataColumn[1];
              dataColumn[2] = data?.method2['1/2" Material'] || dataColumn[2];
              dataColumn[3] = data?.method3['1/2" Material'] || dataColumn[3];
            }
    
            if (valueName === '2x10') {
              dataColumn[1] = data?.method1['2x10'] || dataColumn[1];
              dataColumn[2] = data?.method2['2x10'] || dataColumn[2];
              dataColumn[3] = data?.method3['2x10'] || dataColumn[3];
            }
    
            if (valueName === '2x6') {
              dataColumn[1] = data?.method1['2x6'] || dataColumn[1];
              dataColumn[2] = data?.method2['2x6'] || dataColumn[2];
              dataColumn[3] = data?.method3['2x6'] || dataColumn[3];
            }
    
            if (valueName === '2x12') {
              dataColumn[1] = data?.method1['2x12'] || dataColumn[1];
              dataColumn[2] = data?.method2['2x12'] || dataColumn[2];
              dataColumn[3] = data?.method3['2x12'] || dataColumn[3];
            }

            break;
          }
        }

        return dataColumn;
      });
    }
}