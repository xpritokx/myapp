import { ChangeDetectionStrategy, Component, Inject, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';

import { DeleteStairDialogComponent } from '../delete-stair/delete-stair.component';

import { OrdersService } from '../../../services/orders.service';
import { MaterialsService } from '../../../services/materials.service';
import { RiserTypesService } from '../../../services/riserTypes.service';
import { StairTypesService } from '../../../services/stairTypes.service';
import { StairStylesService } from '../../../services/stairStyles.service';
@Component({
    selector: 'order-details',
    templateUrl: './order-details.component.html',
    imports: [
        FormsModule,
        CommonModule,
        MatTableModule,
        MatDialogModule, 
        MatSelectModule,
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
    imageName = signal('');
    fileSize = signal(0);
    uploadProgress = signal(0);
    imagePreview = signal('');
    @ViewChild('fileInput') fileInput: ElementRef | undefined;
    selectedFile: File | null = null;
    uploadSuccess: boolean = false;
    uploadError: boolean = false;

    selectedMaterialsField: string = '';
    selectedRiserTypeField: string = '';
    selectedStairStyleField: string = '';
    selectedStairTypeField: string = '';
    selectedSectionTypeField: string = '';

    materialFields = [{
        value: 'not-selected',
        viewValue: 'Not selected'
    }];

    stairTypesFields = [{
        value: 'not-selected',
        viewValue: 'Not selected'
    }];

    stairStylesFields = [{
        value: 'not-selected',
        viewValue: 'Not selected'
    }];

    riserTypesFields = [{
        value: 'not-selected',
        viewValue: 'Not selected'
    }];

    stairsList: string[] = [];
    connectedStairs = new FormControl();
    updatedLabel = false;
    imageBlob:any = '';

    sectionTypeFields = [
        {
            value: 'Stair',
            viewValue: 'Stair' 
        },
        {
            value: 'Winder',
            viewValue: 'Winder' 
        },
        {
            value: 'Landing',
            viewValue: 'Landing' 
        }
    ];

    readonly dialog = inject(MatDialog);
    public loading$ = new BehaviorSubject<boolean>(false);
    public updatedLabel$ = new BehaviorSubject<boolean>(false);
    public sectionType$ = new BehaviorSubject<string>('');

    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    ordersService = inject(OrdersService);
    materialsService = inject(MaterialsService);
    riserTypesService = inject(RiserTypesService);
    stairTypesService = inject(StairTypesService);
    stairStylesService = inject(StairStylesService);
    currentOrder = {};
    materials:any = [];
    riserTypes:any = [];
    stairStyles:any = [];
    stairTypes:any = [];

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
        langingOnFloor: new FormControl(false),
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
        connectedTo: new FormControl([])
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<any>,
        private snackBar: MatSnackBar
    ) {
        this.currentOrder = data;

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
            winderCutCorner: new FormControl(data.WinderCutCorner),
            winderSeatLength: new FormControl(data.WinderSeatLength),
            blurb_winder: new FormControl(data.blurb_winder),
            landingSeat: new FormControl(data.Landing_Seat),
            landingPickup: new FormControl(data.Landing_PU),
            landingWrap: new FormControl(data.Landing_Wrap),
            landingPickupOSM: new FormControl(data.Landing_PU_OSM),
            landingWrapOSM: new FormControl(data.Landing_Wrap_OSM),
            langingOnFloor: new FormControl(data.Landing_On_Floor),
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

        this.stairsList = data.stairs.map((s:any) => `Stair ${s.Number}`);
        this.connectedStairs.setValue(data.ConnectedTo.split('$').filter((s:string) => s).map((s:string)=>`Stair ${s}`));
        this.sectionType$.next(this.data.SectionType);
    }

    ngOnInit() {
        this.materials = this.materialsService.getSavedMaterials();
        this.riserTypes = this.riserTypesService.getSavedRiserTypes();
        this.stairTypes = this.stairTypesService.getSavedStairTypes();
        this.stairStyles = this.stairStylesService.getSavedStairStyles();

        this.selectedSectionTypeField = this.data.SectionType;

        this.materialFields = this.materials.map((material: any) => {
            if (this.data.Materials === material.Material) {
                this.selectedMaterialsField = material.ID;
            }
            
            return {
                value: material.ID,
                viewValue: material.Material
            };
        });


        this.riserTypesFields = this.riserTypes.map((riserType: any) => {
            if (this.data.RiserType === riserType.ID) {
                this.selectedRiserTypeField = riserType.ID;
            }
            
            return {
                value: riserType.ID,
                viewValue: riserType.RiserType
            };
        });

        this.stairTypesFields = this.stairTypes.map((stairType: any) => {
            if (this.data.StairType === stairType.ID) {
                this.selectedStairTypeField = stairType.ID;
            }
            
            return {
                value: stairType.ID,
                viewValue: stairType.StairType
            };
        });

        this.stairStylesFields = this.stairStyles.map((stairStyle: any) => {
            if (this.data.Style === stairStyle.ID) {
                this.selectedStairStyleField = stairStyle.ID;
            }

            return {
                value: stairStyle.ID,
                viewValue: stairStyle.StairStyle
            };
        });

        console.log('--DEBUG-- image: ', this.data.Image);
        if (this.data.Image) {
            this.imagePreview.set(this.data.Image as string);
        }
    }

    async cancel() {
        if (this.updatedLabel$.getValue()) {
            this.dialogRef.close('updated');
        } else {
            this.dialogRef.close();
        }
    }

    async upload() {
        await this.ordersService.createImage(this.data.ID, {
            imagedata: this.imageBlob,
            originalfilename: this.imageName(),
            orderNum: this.data.OrderNum,
            description: 'test',
            imagetext: this.imageName()
        });

        this.updatedLabel$.next(true);
    }

    changeFields(e: any) {
        this.orderDetailsForm.get('sectionType')?.setValue(this.selectedSectionTypeField);
        console.log('--DEBUG-- select was changed ', this.orderDetailsForm.get('sectionType')?.value);
        this.sectionType$.next(this.orderDetailsForm.get('sectionType')?.value || '');
    }

    async save() {
        let connectedStairsToSave = this.connectedStairs?.value?.map((s:string) => s.split(' ')[1]).join('$') || '';
        let connectedToOthers = this.connectedOrdersForm.get('connected')?.value;
        let totalHeight = this.connectedOrdersForm.get('totalHeight')?.value;
        let countStairsInHeight = this.connectedOrdersForm.get('countStairsInHeight')?.value;
        let countWindersAndLandings = this.connectedOrdersForm.get('countWindersAndLandings')?.value;
        let cutlistComments = this.orderCommentsForm.get('cutlistComments')?.value;
        let workorderComments = this.orderCommentsForm.get('workorderComments')?.value;
        let invoiceComments = this.orderCommentsForm.get('invoiceComments')?.value;
        let billingComments = this.orderCommentsForm.get('billingComments')?.value;
        let sectionType = this.data.SectionType;

        connectedStairsToSave = connectedStairsToSave ? connectedStairsToSave + '$' : connectedStairsToSave;

        console.log('--DEBUG-- order details save!', connectedStairsToSave);

        if (this.data.SectionType === 'Stair') {
            let location =  this.orderDetailsForm.get('location')?.value;
            let numberOfRises = this.orderDetailsForm.get('riseCount')?.value;
            let stairStyle = this.selectedStairStyleField;
            let stairType = this.selectedStairTypeField;
            let riserType = this.selectedRiserTypeField;

            let lngth = this.orderDetailsForm.get('length')?.value;
            let height = this.orderDetailsForm.get('height')?.value;
            let width = this.orderDetailsForm.get('width')?.value;
            let method = this.orderDetailsForm.get('method')?.value;
            let notch = this.orderDetailsForm.get('notch')?.value;
            let headroomMatters = this.orderDetailsForm.get('headroomMatters')?.value;
            let noNosing =this.orderDetailsForm.get('noNosing')?.value;
            let thirdAndFurred = this.orderDetailsForm.get('furred')?.value;
            let materialData = this.materialFields.find((m: any) => Number(m.value) === Number(this.selectedMaterialsField));
            let materials = materialData?.viewValue || '';
            let stringerStyle1 = this.orderDetailsForm.get('stringerStyle1')?.value;
            let stringerStyle2 = this.orderDetailsForm.get('stringerStyle2')?.value;
            let divisor = this.orderDetailsForm.get('divisor')?.value;

            //WorkOrderExtensions
            let offTheTop = this.orderDetailsForm.get('offTheTop')?.value;

            await this.ordersService.updateStair(this.data.ID, {
                location,
                numberOfRises,
                stairStyle,
                riserType,
                stairType,
                lngth,
                height,
                width,
                method,
                notch,
                headroomMatters,
                offTheTop,
                noNosing,
                thirdAndFurred,
                materials,
                stringerStyle1,
                stringerStyle2,
                divisor,
                connectedToOthers,
                totalHeight,
                countStairsInHeight,
                countWindersAndLandings,
                connectedTo: connectedStairsToSave,
                workorderComments,
                cutlistComments,
                billingComments,
                invoiceComments,
                sectionType,
            });

            this.updatedLabel$.next(true);
        }

        if (this.data.SectionType === 'Winder') {
            let location = this.orderDetailsForm.get('location')?.value;
            let numberOfRises = this.orderDetailsForm.get('riseCount')?.value;
            let stairStyle = this.selectedStairStyleField;
            let riserType = this.selectedRiserTypeField;

            let winderRise = this.orderDetailsForm.get('winderRise')?.value;
            let winderPickup = this.orderDetailsForm.get('winderPickup')?.value;
            let winderOn1 = this.orderDetailsForm.get('winderOn1')?.value;
            let winderOn3 = this.orderDetailsForm.get('winderOn3')?.value;
            let winderWrap = this.orderDetailsForm.get('winderWrap')?.value;
            let winderCutCorner = this.orderDetailsForm.get('winderCutCorner')?.value;
            let winderSeat = this.orderDetailsForm.get('winderSeat')?.value;
            let winderSeatLength = this.orderDetailsForm.get('winderSeatLength')?.value;

            await this.ordersService.updateStair(this.data.ID, {
                location,
                numberOfRises,
                stairStyle,
                riserType,

                winderRise,
                winderWrap,
                winderPickup,
                winderOn1,
                winderOn3,
                winderSeat,
                winderSeatLength,
                winderCutCorner,

                connectedToOthers,
                totalHeight,
                countStairsInHeight,
                countWindersAndLandings,
                connectedTo: connectedStairsToSave,
                workorderComments,
                cutlistComments,
                billingComments,
                invoiceComments,
                sectionType,
            });

            this.updatedLabel$.next(true);
        }

        if (this.data.SectionType === 'Landing') {
            let location = this.orderDetailsForm.get('location')?.value;

            let landingPickup = this.orderDetailsForm.get('landingPickup')?.value;
            let landingWrapPlusOneNosing = this.orderDetailsForm.get('landingWrap')?.value;
            let landingSeat = this.orderDetailsForm.get('landingSeat')?.value;
            let landingOsmOnPickup = this.orderDetailsForm.get('landingPickupOSM')?.value;
            let landingOsmOnWrap = this.orderDetailsForm.get('landingWrapOSM')?.value;
            let landingSitsOnFloor = this.orderDetailsForm.get('langingOnFloor')?.value;
        
            await this.ordersService.updateStair(this.data.ID, {
                location,
                landingPickup,
                landingWrapPlusOneNosing,
                landingSeat,
                landingOsmOnPickup,
                landingOsmOnWrap,
                landingSitsOnFloor,

                connectedToOthers,
                totalHeight,
                countStairsInHeight,
                countWindersAndLandings,
                connectedTo: connectedStairsToSave,

                workorderComments,
                cutlistComments,
                billingComments,
                invoiceComments,
                sectionType,
            });

            this.updatedLabel$.next(true);
        }
    }

    async openDeleteDialog() {
        console.log('--DEBUG-- delete dialog opened: ', this.data);
        const dialogRef = this.dialog.open(DeleteStairDialogComponent, {
            data: {
                ID: this.data.Stair
            }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            console.log(`--DEBUG-- delete dialog result: ${result}`);
        
            if (result) {
                await this.ordersService.deleteStair(
                    this.data.ID, 
                    this.data.OrderNum, 
                    this.data.stairsCount
                );

                this.dialogRef.close('deleted');
            }
        });
    }

        // Handler for file input change
    onFileChange(event: any): void {
        const file = event.target.files[0] as File | null;
        this.uploadFile(file);
    }

    // Handler for file drop
    onFileDrop(event: DragEvent): void {
        event.preventDefault();
        const file = event.dataTransfer?.files[0] as File | null;
        this.uploadFile(file);
    }

    // Prevent default dragover behavior
    onDragOver(event: DragEvent): void {
        event.preventDefault();
    }

  // Method to handle file upload
    uploadFile(file: File | null): void {
        if (file && file.type.startsWith('image/')) {
            this.selectedFile = file;
            this.fileSize.set(Math.round(file.size / 1024)); // Set file size in KB

            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview.set(e.target?.result as string); // Set image preview URL
                this.imageBlob = e.target?.result;
            };
            reader.readAsDataURL(file);

            this.uploadSuccess = true;
            this.uploadError = false;
            this.imageName.set(file.name); // Set image name
        } else {
            this.uploadSuccess = false;
            this.uploadError = true;
            this.snackBar.open('Only image files are supported!', 'Close', {
                duration: 3000,
                panelClass: 'error',
            });
        }
    }

  // Method to remove the uploaded image
  async removeImage() {
    this.selectedFile = null;
    this.imageName.set('');
    this.fileSize.set(0);
    this.imagePreview.set('');
    this.uploadSuccess = false;
    this.uploadError = false;
    this.uploadProgress.set(0);

    await this.ordersService.removeImage(this.data.ID);

    this.updatedLabel$.next(true);
  }
}
