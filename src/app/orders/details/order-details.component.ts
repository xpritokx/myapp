import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';

import { DeleteStairDialogComponent } from '../delete-stair/delete-stair.component';

@Component({
    selector: 'order-details',
    templateUrl: './order-details.component.html',
    imports: [
        CommonModule,
        MatTableModule,
        MatDialogModule, 
        MatButtonModule,
        MatFormFieldModule, 
        MatInputModule,
        MatIconModule,
        MatTabsModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule
    ],
    styleUrls: ['./order-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent implements OnInit {
    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);
    dataSource: MatTableDataSource<any> = new MatTableDataSource();

    orderDetailsForm = new FormGroup({
        height: new FormControl(0),
        width: new FormControl(0),
        location: new FormControl(''),
        sectionType: new FormControl(''),
        length: new FormControl(0),
        run: new FormControl(0),
        rise: new FormControl(0),
        riseCount: new FormControl(0),
        stairStyle: new FormControl(''),
        stairType: new FormControl(''),
        riserType: new FormControl(''),
        method: new FormControl(''),
        divisor: new FormControl(0),
        notch: new FormControl(false),
        headroomMatters: new FormControl(false),
        offTheTop: new FormControl(false),
        noNosing: new FormControl(false),
        furred: new FormControl(false),
        materials: new FormControl(''),
        stringerStyle1: new FormControl(''),
        stringerStyle2: new FormControl(''),
        sectionDesc: new FormControl(''),
        winderRise: new FormControl(0),
        winderPickup: new FormControl(0),
        winderWrap: new FormControl(0),
        winderOn1: new FormControl(0),
        winderOn3: new FormControl(0),
        winderSeat: new FormControl(false),
        winderSeatLength: new FormControl(0),
        winderCutCorner: new FormControl(''),
        blurb_winder: new FormControl(''),
        landingSeat: new FormControl(0),
        landingPickup: new FormControl(0),
        landingWrap: new FormControl(0),
        landingPickupOSM: new FormControl(0),
        landingWrapOSM: new FormControl(0),
        langingOnFloor: new FormControl(false)
    });

    orderCommentsForm = new FormGroup({
        cutlistComments: new FormControl(''),
        workorderComments: new FormControl(''),
        invoiceComments: new FormControl(''),
        billingComments: new FormControl('')
    });

    connectedOrdersForm = new FormGroup({
        connected: new FormControl(false),
        totalHeight: new FormControl(0),
        countStairsInHeight: new FormControl(0),
        countWindersAndLandings: new FormControl(0),
        connectedTo: new FormControl('')
    });

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.orderDetailsForm = new FormGroup({
            height: new FormControl(data.Height),
            width: new FormControl(data.Width),
            location: new FormControl(data.Location),
            sectionType: new FormControl(data.SectionType),
            length: new FormControl(data.headroomlength),
            run: new FormControl(data.StairRun),
            rise: new FormControl(data.RiseOfStair),
            riseCount: new FormControl(data.FullRises),
            stairStyle: new FormControl(data.StairStyleName),
            stairType: new FormControl(data.StairTypeName),
            riserType: new FormControl(data.RiserTypeName),
            method: new FormControl(data.Method),
            divisor: new FormControl(data.Divisor),
            notch: new FormControl(data.Notch),
            offTheTop: new FormControl(data.OffTheTop),
            headroomMatters: new FormControl(data.HeadroomMatters),
            noNosing: new FormControl(data.NoNosing),
            furred: new FormControl(data.Furred),
            materials: new FormControl(data.Materials),
            stringerStyle1: new FormControl(data.StringerStyle1),
            stringerStyle2: new FormControl(data.StringerStyle2),
            sectionDesc: new FormControl(data.SectionDesc),
            winderRise: new FormControl(data.WinderRise),
            winderPickup: new FormControl(data.WinderPickup),
            winderWrap: new FormControl(data.WinderWrap),
            winderOn1: new FormControl(data.WinderOn1),
            winderOn3: new FormControl(data.WinderOn3),
            winderSeat: new FormControl(data.WinderSeat),
            winderSeatLength: new FormControl(data.WinderSeatLength),
            winderCutCorner: new FormControl(data.WinderCutCorner),
            blurb_winder: new FormControl(data.blurb_winder),
            landingSeat: new FormControl(data.Landing_Seat),
            landingPickup: new FormControl(data.Landing_PU),
            landingWrap: new FormControl(data.Landing_Wrap),
            landingPickupOSM: new FormControl(data.Landing_PU_OSM),
            landingWrapOSM: new FormControl(data.Landing_Wrap_OSM),
            langingOnFloor: new FormControl(data.Landing_On_Floor)
        });

        this.orderCommentsForm = new FormGroup({
            cutlistComments: new FormControl(data.CutlistComments),
            workorderComments: new FormControl(data.WorkorderComments),
            invoiceComments: new FormControl(data.InvoiceComments),
            billingComments: new FormControl(data.BillingComments)
        });

        this.connectedOrdersForm = new FormGroup({
            connected: new FormControl(data.Connected),
            totalHeight: new FormControl(data.TotalHeight),
            countStairsInHeight: new FormControl(data.NumStrcasesInHeight),
            countWindersAndLandings: new FormControl(data.WindersAndLandings),
            connectedTo: new FormControl(data.ConnectedTo)
        });
    }

    ngOnInit() {}

    apply() {
        console.log('--DEBUG-- order details apply!');
    }

    openDeleteDialog() {
        console.log('--DEBUG-- delete dialog opened: ', this.data);
        const dialogRef = this.dialog.open(DeleteStairDialogComponent, {
            data: {
                ID: this.data.Stair
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`--DEBUG-- delete dialog result: ${result}`);
        });
    }
}