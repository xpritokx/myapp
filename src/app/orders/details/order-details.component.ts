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
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { SelectImageDetail } from '../select-image-detail/select-image-detail.component';
import { DeleteStairDialogComponent } from '../delete-stair/delete-stair.component';
import { ErrorDialogWindow } from '../../error/error-dialog.component';
import { ShowMethodsInfoDialog } from '../../info/showMethodsInfo/show-methods-info.component';

import { OrdersService } from '../../../services/orders.service';
import { MaterialsService } from '../../../services/materials.service';
import { RiserTypesService } from '../../../services/riserTypes.service';
import { StairTypesService } from '../../../services/stairTypes.service';
import { StringerStylesService } from '../../../services/stringerStyles.service';
import { StairStylesService } from '../../../services/stairStyles.service';
import { ImagesService } from '../../../services/images.service';
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
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule
    ],
    styleUrls: ['./order-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent implements OnInit {
    @ViewChild('fileInput') fileInput: ElementRef | undefined;
    imageName = signal('');
    fileSize = signal(0);
    uploadProgress = signal(0);
    imagePreview = signal('');
    selectedFile: File | null = null;
    uploadSuccess: boolean = false;
    uploadError: boolean = false;
    riseCountWasChanged:boolean = false;
    divisor: number = 0;

    imageIndexStrcss:number = 0;
    imageIndexImgsWndw:number = 0;

    blurb_left_bullnose: string = '';
    blurb_right_bullnose: string = '';
    blurb_left_flair: string = '';
    blurb_right_flair: string = '';

    selectedMethodField: string = '';
    selectedMaterialsField: string = '';
    selectedRiserTypeField: string = '';
    selectedStairStyleField: string = '';
    selectedStairTypeField: string = '';
    selectedSectionTypeField: string = '';
    selectedStringerStyle1Field: string = '';
    selectedStringerStyle2Field: string = '';


    locationName: string = ''; 
    stairsList: string[] = [];
    imageBlob: any = '';

    connectedStairs = new FormControl();
    location = new FormControl('');
    updatedLabel = false;

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

    stringerStylesFields = [{
        value: 'not-selected',
        viewValue: 'Not selected'
    }];

    riserTypesFields = [{
        value: 'not-selected',
        viewValue: 'Not selected'
    }];

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
    
    locationMockData = [
        {
            value: 'Up',
            viewValue: 'Up' 
        },
        {
            value: 'Up2',
            viewValue: 'Up2' 
        },
        {
            value: 'Mid',
            viewValue: 'Mid' 
        },
        {
            value: 'Main',
            viewValue: 'Main' 
        },
        {
            value: 'Base',
            viewValue: 'Base' 
        },
        {
            value: 'Low',
            viewValue: 'Low' 
        },
        {
            value: 'Lower',
            viewValue: 'Lower' 
        },
        {
            value: 'Lowest',
            viewValue: 'Lowest' 
        },
        {
            value: 'Loft',
            viewValue: 'Loft' 
        },
        {
            value: 'Garage',
            viewValue: 'Garage' 
        },
        {
            value: 'Deck',
            viewValue: 'Deck' 
        },
        {
            value: 'PWF Deck',
            viewValue: 'PWF Deck' 
        },
        {
            value: '5/4 PWF Deck',
            viewValue: '5/4 PWF Deck' 
        },
        {
            value: 'Commercial Grade',
            viewValue: 'Commercial Grade' 
        }
    ];

    methodsMockData: {
        value: string;
        viewValue: string;
    }[] = [
        {
            value: 'A',
            viewValue: 'A',
        },
        {
            value: 'B',
            viewValue: 'B' 
        },
        {
            value: 'C',
            viewValue: 'C' 
        },
        {
            value: 'Custom',
            viewValue: 'Custom' 
        }
    ];

    methodsData: {[key: string]: number} = {
        'A' : 7.875,
        'B' : 8,
        'C': 7.0625,
        'Custom': 0
    };

    public loading$ = new BehaviorSubject<boolean>(false);
    public updatedLabel$ = new BehaviorSubject<boolean>(false);
    public imageUploadingFailedLabel$ = new BehaviorSubject<boolean>(false);
    public garage$ = new BehaviorSubject<boolean>(false);
    public offTheTop$ = new BehaviorSubject<boolean>(false);
    public headroomMatters$ = new BehaviorSubject<boolean>(false);

    public sectionType$ = new BehaviorSubject<string>('');
    public imgs$ = new BehaviorSubject<any[]>([]);

    filteredLocationOptions$: Observable<any[]> | undefined;

    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    
    dialog = inject(MatDialog);
    imagesService = inject(ImagesService);
    ordersService = inject(OrdersService);
    materialsService = inject(MaterialsService);
    riserTypesService = inject(RiserTypesService);
    stairTypesService = inject(StairTypesService);
    stairStylesService = inject(StairStylesService);
    stringerStylesService = inject(StringerStylesService);

    currentOrder:any = {};
    materials:any = [];
    riserTypes:any = [];
    stairStyles:any = [];
    stairTypes:any = [];
    stringerStyles:any = [];

    materialsDisabled: boolean = false;

    orderDetailsForm = new FormGroup({
        height: new FormControl(0),
        width: new FormControl(0),
        location: new FormControl(''),
        sectionType: new FormControl(''),
        length: new FormControl(0),
        run: new FormControl(0),
        rise: new FormControl(0),
        riseCount: new FormControl(0),
        treadsCount: new FormControl(0),
        stairStyle: new FormControl(''),
        stairType: new FormControl(''),
        riserType: new FormControl(''),
        method: new FormControl(''),
        divisor: new FormControl(0),
        notch: new FormControl(false),
        headroomMatters: new FormControl(false),
        offTheTop: new FormControl(false),
        offTheTopVal: new FormControl(0),
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
        custDeck: new FormControl(0),
        custGarage: new FormControl(0),
        custStyle1Adj: new FormControl(0),
        custStyle2Adj: new FormControl(0),
        sill: new FormControl(0),
        opening: new FormControl(0),
        joist: new FormControl(0),
        headroomTotal: new FormControl(0)

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

        this.filteredLocationOptions$ = this.location.valueChanges.pipe(
            startWith(''),
            map(value => this._filterLocations(value || '')),
        );

        this.materials = this.materialsService.getSavedMaterials();
        this.riserTypes = this.riserTypesService.getSavedRiserTypes();
        this.stairTypes = this.stairTypesService.getSavedStairTypes();
        this.stairStyles = this.stairStylesService.getSavedStairStyles();
        this.stringerStyles = this.stringerStylesService.getSavedStringerStyles();

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

        this.stringerStylesFields = this.stringerStyles.map((stringerStyle: any) => {
            if (this.data.stringerStyle1 === stringerStyle.ID) {
                this.selectedStringerStyle1Field = stringerStyle.ID;
            }

            if (this.data.stringerStyle2 === stringerStyle.ID) {
                this.selectedStringerStyle2Field = stringerStyle.ID;
            }

            return {
                value: stringerStyle.ID,
                viewValue: stringerStyle.StringerStyles
            };
        });

        this.selectedMethodField = data.Method || this.methodsMockData[0].value;

        this.location.setValue(data.Location);
        data.locationName = data.Location;

        this.orderDetailsForm = new FormGroup({
            height: new FormControl(data.Height.toFixed(3)),
            width: new FormControl(data.Width.toFixed(3)),
            location: new FormControl(data.Location),
            sectionType: new FormControl(data.SectionType),
            length: new FormControl(data.headroomlength.toFixed(3)),
            run: new FormControl(data.StairRun),
            rise: new FormControl(data.RiseOfStair.toFixed(3)),
            riseCount: new FormControl(data.FullRises || 0),
            treadsCount: new FormControl(data.CustomNumCustomTreads || 0),
            stairStyle: new FormControl(data.StairStyleName || 1),
            stairType: new FormControl(data.StairTypeName || 1),
            riserType: new FormControl(data.RiserTypeName || 1),
            method: new FormControl(data.Method || this.methodsMockData[0].value),
            divisor: new FormControl(data.Divisor),
            notch: new FormControl(data.Notch),
            offTheTop: new FormControl(data.OffTheTop !== 0),
            offTheTopVal: new FormControl(data.OffTheTop),
            headroomMatters: new FormControl(data.HeadroomMatters),
            noNosing: new FormControl(data.NoNosing),
            furred: new FormControl(data.Furred),
            materials: new FormControl(data.Materials || this.materialFields[0].value),
            stringerStyle1: new FormControl(data.StringerStyle1 || -1),
            stringerStyle2: new FormControl(data.StringerStyle2 || -1) ,
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
            custDeck: new FormControl(1.5),
            custGarage: new FormControl(1.5),
            custStyle1Adj: new FormControl(1.5),
            custStyle2Adj: new FormControl(1.5),
            sill: new FormControl(data.Sill),
            opening: new FormControl(data.Opening),
            joist: new FormControl(data.Joist),
            headroomTotal: new FormControl(data.Opening + data.Joist)
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
        let img = this.data.Images?.length && this.data.Images[0].img || '';
        let method;

        this.orderDetailsForm.get('run')?.disable();
        this.orderDetailsForm.get('rise')?.disable();
        this.orderDetailsForm.get('treadsCount')?.disable();
        this.orderDetailsForm.get('riseCount')?.disable();
        
        method = this.orderDetailsForm.get('method')?.value;

        switch(method) {
            case 'A': {
                this.divisor = this.methodsData['A'];

                break;
            }

            case 'B': {
                this.divisor = this.methodsData['B'];
                break;
            }

            case 'C': {
                this.divisor = this.methodsData['C'];
                break;
            }

            default: {
                this.divisor = this.methodsData['Custom'];
            }
        }

        const topLeftimages = this.imagesService.getSavedDefaultImages('top_left_images');
        const topRightImages = this.imagesService.getSavedDefaultImages('top_right_images');
        const bottomLeftImages = this.imagesService.getSavedDefaultImages('bottom_left_images');
        const bottomRightImages = this.imagesService.getSavedDefaultImages('bottom_right_images');

        const topLeftImagesObj: any = {};
        const topRightImagesObj: any = {};
        const bottomLeftImagesObj: any = {};
        const bottomRightImagesObj: any = {};

        topLeftimages.forEach((topLeftimage: any) => {
            topLeftImagesObj[topLeftimage.ImageText] = topLeftimage.Image;
        });

        topRightImages.forEach((topRightImage: any) => {
            topRightImagesObj[topRightImage.ImageText] = topRightImage.Image;
        });

        bottomLeftImages.forEach((bottomLeftImage: any) => {
            bottomLeftImagesObj[bottomLeftImage.ImageText] = bottomLeftImage.Image;
        });

        bottomRightImages.forEach((bottomRightImage: any) => {
            bottomRightImagesObj[bottomRightImage.ImageText] = bottomRightImage.Image;
        });
    
        console.log('--DEBUG-- images bullnose and flairs: ', {
            topLeftImagesObj,
            topRightImagesObj,
            bottomLeftImagesObj,
            bottomRightImagesObj
        });

        let imagesFromServer = this.data.Images.filter((i: any) => {
            return !i.type.includes('Flair') || !i.type.includes('Bull');
        });
        let altImages = [];

        if (this.data.blurb_left_bullnose) altImages.push({
            img: bottomLeftImagesObj[`${this.data.blurb_left_bullnose}_L`]
        });
        if (this.data.blurb_right_bullnose) altImages.push({
            img: bottomRightImagesObj[`${this.data.blurb_right_bullnose}_R`]
        });
        if (this.data.blurb_left_flair) altImages.push({
            img: topLeftImagesObj[`${this.data.blurb_left_flair}_L`]
        });
        if (this.data.blurb_right_flair) altImages.push({
            img: topRightImagesObj[`${this.data.blurb_right_flair}_R`]
        });

        console.log('--DEBUG-- alt Images: ', altImages);

        this.imgs$.next([
            ...altImages,
            ...imagesFromServer
        ]);

        console.log('--DEBUG-- first image: ', img);
        if (img) {
            this.imagePreview.set(img as string);
            this.imageIndexStrcss = 0;
        }

        console.log('--DEBUG-- this.divisor: ', this.divisor);

        if (method === 'Custom') {
            let customHt: number = this.data.Height;
            let cunstomNumRisers: number = this.data.FullRises;

            let customRise1 = cunstomNumRisers === 0 ? 0 : Math.round(16 * (customHt / cunstomNumRisers)) / 16;
            let customRise2 = cunstomNumRisers === 0 ? 0 : Math.round(16 * (customHt / (cunstomNumRisers - 1))) / 16;
        
            this.divisor = (customRise1 + customRise2) / 2;
        }

        this.orderDetailsForm.get('divisor')?.setValue(this.divisor);

        this.reCalculateEverything();
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

        let updateObj: object = {};

        if (this.data.SectionType === 'Stair') {
            //console.log('--DEBUG-- stair location 2: ', this.location.value);

            let location = this.location.value;
            let numberOfRises = this.orderDetailsForm.get('riseCount')?.value;
            let numberOfTreads = this.orderDetailsForm.get('treadsCount')?.value
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

            let calculatedObj = this.recalculateAccuratelyForOneMethod(method as string, this.methodsData[method as string]);
            let osm = calculatedObj.topRiserWidth;
            let oneInchPly = calculatedObj.oneInch;
            let halfInchPly = calculatedObj.halfInch;
            let meas2X6 = calculatedObj.twoTenInch;
            let meas2X10 = calculatedObj.twoSixInch;
            let meas2X12 = calculatedObj.twoTwelve;

            //WorkOrderExtensions
            let offTheTop = this.orderDetailsForm.get('offTheTop')?.value;

            updateObj = {
                location,
                numberOfRises,
                numberOfTreads,
                stairStyle,
                sectionType,
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
                osm,
                oneInchPly,
                halfInchPly,
                meas2X6,
                meas2X10,
                meas2X12,

                blurb_left_flair: this.blurb_left_flair && this.blurb_left_flair.split('_')[0] || '',
                blurb_right_flair: this.blurb_right_flair && this.blurb_right_flair.split('_')[0] || '',
                blurb_left_bullnose: this.blurb_left_bullnose && this.blurb_left_bullnose.split('_')[0] || '',
                blurb_right_bullnose: this.blurb_right_bullnose && this.blurb_right_bullnose.split('_')[0] || '',

                connectedToOthers,
                totalHeight,
                countStairsInHeight,
                countWindersAndLandings,
                connectedTo: connectedStairsToSave,

                workorderComments,
                cutlistComments,
                billingComments,
                invoiceComments,
            };

            this.updatedLabel$.next(true);
        }

        if (this.data.SectionType === 'Winder') {
            let location = this.location.value;
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

            updateObj = {
                location,
                numberOfRises,
                stairStyle,
                sectionType,
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
            };
        }

        if (this.data.SectionType === 'Landing') {
            let location = this.location.value;

            let landingPickup = this.orderDetailsForm.get('landingPickup')?.value;
            let landingWrapPlusOneNosing = this.orderDetailsForm.get('landingWrap')?.value;
            let landingSeat = this.orderDetailsForm.get('landingSeat')?.value;
            let landingOsmOnPickup = this.orderDetailsForm.get('landingPickupOSM')?.value;
            let landingOsmOnWrap = this.orderDetailsForm.get('landingWrapOSM')?.value;
            let landingSitsOnFloor = this.orderDetailsForm.get('langingOnFloor')?.value;
        
            updateObj = {
                location,
                landingPickup,
                landingWrapPlusOneNosing,
                landingSeat,
                landingOsmOnPickup,
                landingOsmOnWrap,
                landingSitsOnFloor,
                sectionType,

                connectedToOthers,
                totalHeight,
                countStairsInHeight,
                countWindersAndLandings,
                connectedTo: connectedStairsToSave,

                workorderComments,
                cutlistComments,
                billingComments,
                invoiceComments,
            };
        }

        try {
            await this.ordersService.updateStair(this.data.ID, updateObj);
            
            this.updatedLabel$.next(true);
        } catch (err: any) {
            this.loading$.next(false);
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }









    // RECALCULATE METHODS!!!

    // recalculate everything
    reCalculateEverything() {
        this.recalculateRiseOfStairs(true);
        if (!this.riseCountWasChanged) {
            this.recalculateNumberRiseOfStairs(true);
        }
        this.recalculateRun(true);
        this.recalculateNumberTreadsOfStairs(true);
        this.recalculateHeadroomTotal(true, {});
    }

    // RUN
    recalculateRun(changeInputs: boolean = false, values?:any) {
        let customWindersType = values?.customWindersType || Number(this.orderDetailsForm.get('customWindersType')?.value);
        let winderOn3 = values?.winderOn3 || Number(this.orderDetailsForm.get('wnderOn3')?.value);
        let winderWrap = values?.winderWrap || Number(this.orderDetailsForm.get('winderWrap')?.value);
        let numRisers = values?.numRisers || Number(this.orderDetailsForm.get('riseCount')?.value);
        let length = values?.lngth || Number(this.orderDetailsForm.get('length')?.value);
        let run = 0;

        if (customWindersType > 0) {
            run = winderOn3 + winderWrap;
        } else {
            if (numRisers > 1) {
                run = Math.floor(8 * (length - 3) / (numRisers - 1)) / 8;
            } else {
                run = length - 3;
            }
        }
        console.log('--DEBUG-- run: ', run);

        if (changeInputs) return this.orderDetailsForm.get('run')?.setValue(run);

        return run;
    };

    // # OF RISES
    recalculateNumberRiseOfStairs(changeInputs: boolean = false, values?:any):number {
        let height: number = values?.height || Number(this.orderDetailsForm.get('height')?.value);
        let rise: number = values?.rise || Number(this.orderDetailsForm.get('rise')?.value);
        let riseOfStairsNum: number = 0;

        console.log('--DEBUG-- recalculateNumberRiseOfStairs: ', {
            height,
            rise,
            riseOfStairsNum
        });

        this.riseCountWasChanged = false;

        if (this.data.SectionType === 'Stair') {
            riseOfStairsNum = Math.round(16 * height / rise) / 16;
        }

        if (changeInputs) this.orderDetailsForm.get('riseCount')?.setValue(riseOfStairsNum || 0);

        return riseOfStairsNum || 0;
    }

    // # OF TREADS
    recalculateNumberTreadsOfStairs(changeInputs: boolean = false, values?:any) {
        let stairType = values?.stairType || Number(this.selectedStairTypeField);
        let numRisers = values?.numRisers || Number(this.orderDetailsForm.get('riseCount')?.value);
        let custTreads = values?.custTreads || Number(this.data.CustomNumCustomTreads);
        let numberTreads: number = 0;

        if (stairType === 3) {
            numberTreads = (numRisers - 1) * 2;
        } else {
            numberTreads = (numRisers - 1) - custTreads;
        }

        if (numberTreads < 0) numberTreads = 0;
        if (changeInputs) this.orderDetailsForm.get('treadsCount')?.setValue(numberTreads);

        return numberTreads;
    }

    // TREAD RUN
    recalculateTreadRun(values?:any) {
        let materialData = this.materialFields.find((m: any) => Number(m.value) === Number(this.selectedMaterialsField));
        let location = values?.location || this.location?.value;
        let customNumCustomTreads = values?.customNumCustomTreads || Number(this.data?.CustomNumCustomTreads);
        let numRisers = values?.numRisers || Number(this.orderDetailsForm.get('riseCount')?.value);
        let winderOn3 = values?.winderOn3 || Number(this.orderDetailsForm.get('WinderOn3')?.value);
        let winderWrap = values?.winderWrap || Number(this.orderDetailsForm.get('winderWrap')?.value);
        let materials = values?.materials || materialData?.viewValue;
        let stairType = values?.stairType || Number(this.selectedStairTypeField);
        let length = values?.lngth || Number(this.orderDetailsForm.get('length')?.value);
        let noNosing = values?.noNosing || Number(this.orderDetailsForm.get('noNosing')?.value);

        let treadRun: number = 0;

        console.log('--DEBUG-- recalculateTreadRun: ', {
            materialData,
            location,
            customNumCustomTreads,
            numRisers,
            winderOn3,
            winderWrap,
            materials,
            stairType,
            length,
            noNosing
        });

        if (customNumCustomTreads > 0) {
            treadRun = winderOn3 - winderWrap;
            console.log('--DEBUG-- recalculateTreadRun 1');
        } else if (materials.includes('5/4')) {
            treadRun = -5.4;
            console.log('--DEBUG-- recalculateTreadRun 2');
        } else if (stairType === 2) {
            treadRun = -2.10;
            console.log('--DEBUG-- recalculateTreadRun 3');
        } else if (stairType === 3) {
            treadRun = -2.6;
            console.log('--DEBUG-- recalculateTreadRun 4');
        } else if (stairType === 4) {
            if (location.includes('deck')) {
                treadRun = -2.6;
                console.log('--DEBUG-- recalculateTreadRun 5');
            } else if (location.includes('garage')) {
                treadRun = -2.10;
                console.log('--DEBUG-- recalculateTreadRun 6');
            } else {
                let a;
                let b;

                if (numRisers > 1) a = Math.floor(4 * (length - 3) / (numRisers - 1)) / 4;
                else a = length - 3;

                if (noNosing === 1) b = 0;
                else b = 1;

                treadRun = a + b;
                console.log('--DEBUG-- recalculateTreadRun 7');
            }
        } else {
            let a;
            let b;

            if (numRisers > 1) a = Math.floor(8 * (length - 3) / (numRisers - 1)) / 8;
            else a = length - 3;

            if (noNosing === 1) b = 0;
            else b = 1;

            treadRun = a + b;
            console.log('--DEBUG-- recalculateTreadRun 8');
        }

        return treadRun;
    }

    // RISE
    recalculateRiseOfStairs(changeInputs: boolean = false, values?: any) {
        let divisor = values?.divisor || this.divisor;
        let height: number = values?.height || Number(this.orderDetailsForm.get('height')?.value);
        let customWindersType = values?.customWindersType ||  Number(this.currentOrder?.CustomWindersType);
        let landingWrapOSM = values?.landing_Wrap_OSM || Number(this.currentOrder?.Landing_Wrap_OSM);
        let customNumCustomTreads = values?.customNumCustomTreads || Number(this.currentOrder?.CustomNumCustomTreads);
        let numRisers = values?.numRisers || Number(this.orderDetailsForm.get('riseCount')?.value);
    
        console.log('--DEBUG-- hght: ', this.orderDetailsForm.get('height')?.value);

        console.log('--DEBUG-- Recalculate Rise Of Stairs: ', {
            divisor,
            height,
            customNumCustomTreads,
            customWindersType,
            numRisers,
            landingWrapOSM,
        });

        let riseOfStairs: number = 0;

        if (customWindersType > 0) {
            if (customNumCustomTreads > 0) {
                riseOfStairs = this.roundTo(16 * height / customNumCustomTreads, 3) / 16;
            } else {
                this.roundTo(
                    height / (
                        Math.ceil(height / divisor)
                    ),
                    3
                );
            }
        } else if (landingWrapOSM > 0) {
            riseOfStairs = 0;
        } else {
            if (numRisers > 0 && this.riseCountWasChanged) {
                riseOfStairs = this.roundTo(16 * height / numRisers, 3) / 16;
            } else {
                riseOfStairs = this.roundTo(
                    height / (
                        Math.ceil(height / divisor)
                    ),
                    3
                );
            }
        }

        if (changeInputs) return this.orderDetailsForm.get('rise')?.setValue(riseOfStairs || 0);

        return riseOfStairs || 0;
    }

    recalculateNewHeight(values?:any) {
        let height: number = values?.height || Number(this.orderDetailsForm.get('height')?.value);
        let numRisers = values?.numRisers || Number(this.orderDetailsForm.get('riseCount')?.value);
        let newHeight:number = 0;

        if (numRisers > 0) newHeight = (Math.round(16 * height / numRisers) / 16) * numRisers;
        else newHeight = 0;

        return newHeight;
    }

    recalculateHeightDifference(values?:any) {
        let height: number = values?.height || Number(this.orderDetailsForm.get('height')?.value);
        let newHeight: number = values?.newHeight;
        let heightDifference:number = 0;

        if (newHeight > 0) heightDifference = height - newHeight;
        else heightDifference = 0;

        return heightDifference;
    }

    recalculateTreadWidth(values: any) {
        let stairStyle = values?.stairStyle || Number(this.selectedStairStyleField);
        let osm = values.osm;
        let treadWidth:number = 0;

        if (stairStyle === 2) treadWidth = osm; 
        else treadWidth = osm - 2.125;
        console.log('--DEBUG-- recalculateTreadWidth: ', treadWidth);

        return treadWidth;
    }

    recalculateRiserWidth(values: any) {
        let stairStyle = values?.stairStyle || Number(this.selectedStairStyleField);
        let osm = values.osm;
        let riserWidth:number = 0;

        if (stairStyle === 2) riserWidth = osm;
        else riserWidth = osm - 2.125 - 0.0625;
        console.log('--DEBUG-- recalculateRiserWidth: ', riserWidth);

        return riserWidth; 
    }

    recalculateOSM(values: any) {
        let stairStyle = values?.stairStyle || Number(this.selectedStairStyleField);
        let stairType = values?.stairType || Number(this.selectedStairTypeField);
        let width = values?.width || Number(this.orderDetailsForm.get('width')?.value);
        let custDeck = values?.custDeck || Number(this.orderDetailsForm.get('custDeck')?.value);
        let custGarage = values?.custGarage || Number(this.orderDetailsForm.get('custGarage')?.value);
        let custAdj1 = values?.custAdj1 || Number(this.orderDetailsForm.get('custStyle1Adj')?.value);
        let custAdj2 = values?.custAdj2 || Number(this.orderDetailsForm.get('custStyle2Adj')?.value);
        
        let osm: number = 0;

        if (stairType === 2) osm = width - custGarage;
        else if (stairType === 3) osm = width - custDeck;
        else if (stairStyle === 1) osm = width - custAdj1;
        else if (stairStyle === 2) osm = width - custAdj2;
        else if (stairStyle === 3) osm = width;
        else osm = width - 1.25;

        return osm;
    };

    recalculateBottomRiser(values: any) {
        let rise: number = values?.rise || Number(this.orderDetailsForm.get('rise')?.value);
        let stairStyle = values?.stairStyle || Number(this.selectedStairStyleField);
        let bottomRiser: number = 0;

        if (stairStyle === 3) bottomRiser = rise - 1.5;
        else bottomRiser = rise - 1;

        return bottomRiser;
    }

    recalculateAdjustedBottomRiser(values: any) {
        let bottomRiser: number = values?.bottomRiser;
        let heightDifference: number = values?.heightDifference;

        return Math.round(16 * (bottomRiser - (heightDifference / 2))) / 16;
    }

    recalculateTopRiser(values: any) {
        let materialData = this.materialFields.find((m: any) => Number(m.value) === Number(this.selectedMaterialsField));
        let osm = values.osm;
        let height: number = values?.height || Number(this.orderDetailsForm.get('height')?.value);
        let sill:number = values?.sill || this.data.Sill; 
        let location = values?.location || this.location?.value;
        let materials = values?.materials || materialData?.viewValue;
        let rise: number = values?.rise || Number(this.orderDetailsForm.get('rise')?.value);
        let stairType: number = values?.stairType || Number(this.selectedStairTypeField);
        let riserType: number = values?.riserType || Number(this.selectedRiserTypeField);
        let stairStyle = values?.stairStyle || Number(this.selectedStairStyleField);
        let topRiser: number = 0;
        
        if (stairStyle === 2) topRiser = 13;
        else if (
            ((stairType === 1 || stairType === 4) && osm > 45) ||
            ((stairType === 3 && riserType === 1) && osm > 42) ||
            ((stairType === 2 || riserType === 3) && osm >= 37.25)
        ) topRiser = 12; 
        else {
            let adjustedTread:number = 0;

            if (stairType === 2) adjustedTread = 1.5 + (sill - height);
            else if (stairType === 3)  adjustedTread = 1.5;
            else if (materials.includes('5/4') || location.includes('5/4'))  adjustedTread = 1.25;
            else if (materials.includes('2 1/2'))  adjustedTread = 2.5;
            else adjustedTread = 1;

            topRiser = rise + adjustedTread;
        }

        return topRiser;
    }

    recalculateAdjustedTopRiser(values: any) {
        let topRiser: number = values?.topRiser;
        let heightDifference: number = values?.heightDifference;

        return Math.round(16 * (topRiser - (heightDifference / 2))) / 16;
    }

    recalculateAdjustedHeight(values: any) {
        let numRisers = values?.numRisers || Number(this.orderDetailsForm.get('riseCount')?.value);
        let adjBottom = values.adjBottom;
        let adjTop = values.adjTop;
        let rise: number = values?.rise || Number(this.orderDetailsForm.get('rise')?.value);

        return adjTop + adjBottom + (rise * (numRisers - 2));
    }

    recalculateOneInch(values: any) {
        let numTreads = values?.numTreads;
        let treadRun = values?.treadRun || this.data.TreadRun;
        let treadWidth = values?.treadWidth || this.data.TreadWidth;
        let oneInch: number = 0;

        if (numTreads < 0 || treadRun < 0) oneInch = 0;
        else oneInch = Math.round(4 * (numTreads * treadRun * treadWidth / 144)) / 4;

        return oneInch;
    }

    recalculateHalfInch(values: any) {
        let riserWidth = values?.riserWidth || this.data.RiserWidth;
        let numRisers = values?.numRisers || Number(this.orderDetailsForm.get('riseCount')?.value);
        let rise: number = values?.rise || Number(this.orderDetailsForm.get('rise')?.value);
        let adjBottom = values.adjBottom;
        let adjTop = values.adjTop;
        let osm = values.osm;
        let halfInch: number = 0;

        if (numRisers > 0) halfInch = Math.round(4 * (numRisers * riserWidth * rise) / 144) / 4;
        else halfInch = Math.round(4 * (0 + (adjBottom * riserWidth) + (adjTop * osm)) / 144) /  4;

        return halfInch;
    }

    recalculateTwoByTen(values: any, method: string) {
        let materialData = this.materialFields.find((m: any) => Number(m.value) === Number(this.selectedMaterialsField));
        let height: number = values?.height || Number(this.orderDetailsForm.get('height')?.value);
        let length = values?.lngth || Number(this.orderDetailsForm.get('length')?.value);
        let stairType = values?.stairType || Number(this.selectedStairTypeField);
        let stairStyle = values?.stairStyle || Number(this.selectedStairStyleField);
        let numRisers = values?.numRisers || Number(this.orderDetailsForm.get('riseCount')?.value);
        let materials = values?.materials || materialData?.viewValue;
        let treadWidth = values?.treadWidth || this.data.TreadWidth;
        let location = values?.location || this.location?.value;
        let numTreads = values?.numTreads;
        let twoTen: number = 0;
        let treadMat: number = 0;
        let stringerMat: number = 0;

        if (stairType == 2) treadMat = treadWidth * numTreads / 12;

        if (
            (method === 'C') ||
            (stairStyle === 2) ||
            (materials.includes('pwf') || location.includes('5/4') && numRisers < 11)
        ) stringerMat = 0;
        else stringerMat = ((Math.sqrt(Math.pow(height, 2) + Math.pow(length, 2)) / 12) - 0.5) * 2;

        twoTen = this.roundTo(treadMat + stringerMat, 3);

        return twoTen;
    }

    recalculateTwoBySix(values: any) {
        let stairType = values?.stairType || Number(this.selectedStairTypeField);
        let treadWidth = values?.treadWidth || this.data.TreadWidth;
        let numTreads = values?.numTreads;
        let twoBySix: number = 0;

        if (stairType === 3) twoBySix = this.roundTo(treadWidth * 2 * numTreads / 12, 3);
        else twoBySix = 0;

        return twoBySix;
    }

    recalculateTwoByTwelve(values: any, method: string) {
        let materialData = this.materialFields.find((m: any) => Number(m.value) === Number(this.selectedMaterialsField));
        let numRisers = values?.numRisers || Number(this.orderDetailsForm.get('riseCount')?.value);
        let height: number = values?.height || Number(this.orderDetailsForm.get('height')?.value);
        let length = values?.lngth || Number(this.orderDetailsForm.get('length')?.value);
        let stairStyle = values?.stairStyle || Number(this.selectedStairStyleField);
        let materials = values?.materials || materialData?.viewValue;
        let location = values?.location || this.location?.value;
        let stringers = values.stringers;
        let mat = 0;
        let angle = this.roundTo((Math.sqrt(Math.pow(height, 2) + Math.pow(length, 2))/ 12) - 0.5, 3);
        
        if (
            method === 'C' ||
            stairStyle === 2 ||
            (materials.includes('pwf') || location.includes('5/4') && numRisers < 11)
        )  mat = angle * stringers;
        else if (stringers > 2) {
            mat = angle * (stringers - 2);
        };

        return this.roundTo(mat, 3);
    }

    recalculateNumStringers(values: any, method: string) {
        let materialData = this.materialFields.find((m: any) => Number(m.value) === Number(this.selectedMaterialsField));
        let stairType = values?.stairType || Number(this.selectedStairTypeField);
        let riserType: number = values?.riserType || Number(this.selectedRiserTypeField);
        let stairStyle = values?.stairStyle || Number(this.selectedStairStyleField);
        let materials = values?.materials || materialData?.viewValue;
        let location = values?.location || this.location?.value;
        let osm = values.osm;
        let stringers: number = 0;

        if (method === 'C') {
            if (osm <= 47) stringers = 3;
            else stringers = 2 + Math.floor(osm / 23);
        } else if (stairStyle === 2) {
            if (riserType === 1) {
                if (osm <= 42.875) stringers = 2;
                else if (osm <= 44.5) stringers = -24;
                else stringers = 2 + Math.floor(osm / 40);
            } else {
                if (osm < 37) stringers = 2;
                else stringers = 3 +  Math.floor((osm - 37) / 36);
            }
        } else if (stairStyle === 3) stringers = 2;
        else if (stairType === 3 && location.includes('5/4')) {
            if (riserType === 1) {
                if (osm <= 42.875) stringers = 2;
                else if (osm <= 44.5) stringers = 3;
                else if (osm <= 80) stringers = 4;
                else stringers = 2 + Math.floor(osm / 40);
            } else {
                if (osm < 27) stringers = 2;
                else stringers = 2 +  Math.floor((osm - 27) / 24);
            }
        } else if (materials.includes('pwf')) {
            if (riserType === 1) {
                if (osm <= 45) stringers = 2;
                else stringers = 2 + Math.floor((osm - 45) / 23);
            } else if (riserType === 3 || stairType === 3) {
                if (materials.includes('5/4')) {
                    if (osm <= 40) stringers = 3;
                    else if (osm <= 71) stringers = 4;
                    else stringers = 5 + Math.floor((osm - 70) / 34);
                } else {
                    if (osm <= 37) stringers = 2;
                    else if (osm <= 70) stringers = 3;
                    else stringers = 4 + Math.floor((osm - 70) / 34);
                }
            } else {
                if (osm < 36) stringers = 2;
                else if (osm <= 50) stringers = 3;
                else if (osm <= 50) stringers = 4;
                else if (osm <= 50) stringers = 5;
                else if (osm <= 50) stringers = 6;
                else stringers = 1 + Math.floor(osm / 25);
            }
        } else if (stairType === 1 || stairType === 4 || stairType === 5) {
            if (osm <= 43) stringers = 2;
            else if (osm <= 45) stringers = -24;
            else if (osm <= 84) stringers = 3;
            else stringers = 4;
        } else if ((stairType === 2 || stairType === 3) && riserType === 1) {
            if (osm <= 37) stringers = 2;
            else if (osm <= 84) stringers = 3;
            else stringers = 2 + Math.floor(osm / 40);
        } else {
            if (osm < 37.25) stringers = 2;
            else stringers = 3 +  Math.floor((osm - 37) / 36);
        }

        return stringers;
    }

    recalculateAccuratelyForOneMethod(method: string, divisor: number) {
        let numRisers: number;

        let riseOfStairs = this.recalculateRiseOfStairs(false, {divisor});

        if (!this.riseCountWasChanged) {
            numRisers = this.recalculateNumberRiseOfStairs(false, {
                rise: riseOfStairs,
            });
        } else {
            numRisers = Number(this.orderDetailsForm.get('riseCount')?.value);
        }
        
        let run = this.recalculateRun(false, {numRisers});

        let treadRun = this.recalculateTreadRun({numRisers});

        let newHeight = this.recalculateNewHeight({numRisers});

        let heightDifference = this.recalculateHeightDifference({newHeight});

        let osm = this.recalculateOSM({});

        let treadWidth = this.recalculateTreadWidth({osm});

        let riserWidth = this.recalculateRiserWidth({osm});

        let numStdRisers: number = numRisers - 2 > 0 ? numRisers - 2 : 0;

        let numTreads = this.recalculateNumberTreadsOfStairs(false, {numRisers});

        let bottomRiser = this.recalculateBottomRiser({
            rise: riseOfStairs,
        });

        let adjustedBottomRiser = this.recalculateAdjustedBottomRiser({
            bottomRiser,
            heightDifference,
        });

        let topRiser = this.recalculateTopRiser({
            rise: riseOfStairs,
            osm
        });

        let adjustedTopRiser = this.recalculateAdjustedTopRiser({
            topRiser,
            heightDifference,
        });

        let topRiserWidth = osm;

        let adjHeight = this.recalculateAdjustedHeight({
            rise: riseOfStairs,
            numRisers,
            adjBottom: adjustedBottomRiser,
            adjTop: adjustedTopRiser
        });

        let oneInch = this.recalculateOneInch({
            numTreads,
            treadRun,
            treadWidth,
        });

        let halfInch = this.recalculateHalfInch({
            riserWidth,
            numRisers: numStdRisers,
            rise: riseOfStairs,
            adjBottom: adjustedBottomRiser,
            adjTop: adjustedTopRiser,
            osm,
        });

        let twoTenInch = this.recalculateTwoByTen({
            numRisers,
            treadWidth,
            numTreads
        }, method);

        let twoSixInch = this.recalculateTwoBySix({
            treadWidth,
            numTreads,
        });

        let stringers = this.recalculateNumStringers({
            osm
        }, method);

        let twoTwelve = this.recalculateTwoByTwelve({
            stringers,
            numRisers
        }, method);

        return {
            riseOfStairs,
            numRisers,
            run,
            treadRun,
            newHeight,
            heightDifference,
            treadWidth,
            riserWidth,
            numTreads,
            bottomRiser,
            adjustedBottomRiser,
            topRiser,
            adjustedTopRiser,
            topRiserWidth,
            adjHeight,
            oneInch,
            halfInch,
            twoTenInch,
            twoSixInch,
            twoTwelve
        };
    }

    recalculateHeadroomTotal(changeInputs: boolean = false, values: any) {
        let opening: number = values?.opening || Number(this.orderDetailsForm.get('opening')?.value);
        let joist: number = values?.joist || Number(this.orderDetailsForm.get('joist')?.value);

        if (changeInputs) return this.orderDetailsForm.get('headroomTotal')?.setValue(opening + joist);

    };







    //DIALOG WINDOWS!!!

    selectStairShape() {
        let data: any = {};

        data = {
            blurb_left_bullnose: this.data.blurb_left_bullnose,
            blurb_right_bullnose: this.data.blurb_right_bullnose,
            blurb_left_flair: this.data.blurb_left_flair,
            blurb_right_flair: this.data.blurb_right_flair
        }

        const dlg = this.dialog.open(SelectImageDetail, {
            data: {
                ...data
            }
        });

        dlg.afterClosed().subscribe(async (result) => {
            console.log('--DEBUG-- select stair shape: ', result);

            if (!result) return;

            let imgs = [
                result.blurb_left_flair,
                result.blurb_right_flair,
                result.blurb_left_bullnose,
                result.blurb_right_bullnose,
            ];

            this.blurb_left_bullnose = result.blurb_left_bullnose.id;
            this.blurb_right_bullnose = result.blurb_right_bullnose.id;
            this.blurb_left_flair = result.blurb_left_flair.id;
            this.blurb_right_flair = result.blurb_right_flair.id;

            this.addBullnoseAndFlairImages(imgs);
            this.imageIndexStrcss = 0;
        });
    }

    showMethodsInfo(): void {
        let data: any = {};

        this.methodsMockData.forEach((v: {
            value: string;
            viewValue: string;
        }, i: number) => {
            let d: number = this.methodsData[v.value];
            let methodName: string = `method${i + 1}`;
            let calculatedObj = this.recalculateAccuratelyForOneMethod(v.value, d);

            data[methodName] = {
                'Rise of Stair': calculatedObj.riseOfStairs,
                '# of Risers': calculatedObj.numRisers,
                'Stair Run': calculatedObj.run,
                'Tread Run': calculatedObj.treadRun,
                'New Height (strcs)': calculatedObj.newHeight,
                'Height Difference': calculatedObj.heightDifference,
                'Tread Width': calculatedObj.treadWidth,
                'Riser Width': calculatedObj.riserWidth,
                '# of Std Risers': calculatedObj.numRisers,
                '# of Treads': calculatedObj.numTreads,
                'Bottom Riser (rise)': calculatedObj.bottomRiser,
                'Adjusted Bottom Rise': calculatedObj.adjustedBottomRiser,
                'Top Riser (rise)': calculatedObj.topRiser,
                'Adjusted Top Rise': calculatedObj.adjustedTopRiser,
                'Top Riser (width)': calculatedObj.topRiserWidth,
                'Adjusted Height': calculatedObj.adjHeight,
                '1" Material': calculatedObj.oneInch,
                '1/2" Material': calculatedObj.halfInch,
                '2x10': calculatedObj.twoTenInch,
                '2x6': calculatedObj.twoSixInch,
                '2x12': calculatedObj.twoTwelve
            };
        });

        this.dialog.open(ShowMethodsInfoDialog, {
            data: {
                ...data
            }
        });
    }

    async openDeleteDialog() {
        console.log('--DEBUG-- delete dialog opened: ', this.data);
        const dialogRef = this.dialog.open(DeleteStairDialogComponent, {
            data: {
                ID: this.data.Stair
            },
            panelClass: 'delete-stair-dialog'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            console.log(`--DEBUG-- delete dialog result: ${result}`);
        
            if (result) {
                try {
                    await this.ordersService.deleteStair(
                        this.data.ID, 
                        this.data.OrderNum, 
                        this.data.stairsCount
                    );
    
                    this.dialogRef.close('deleted');
                } catch (err: any) {
                    this.loading$.next(false);
                    this.dialog.open(ErrorDialogWindow, {
                        data: {
                            errorMessage: err.error
                        }
                    });
                }
            }
        });
    }







    // HELPERS METHODS

    addBullnoseAndFlairImages(imgs: any) {
        let imagesFromServer = this.data.Images.filter((i: any) => {
            return !i.type.includes('Flair') || !i.type.includes('Bull');
        });

        this.imgs$.next([...imagesFromServer, ...imgs]);
    }

    roundTo(value: number, decimals: number): number {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    _filterLocations(value: any) {
        let filterValue = '';
        
        if (value?.viewValue) {
            filterValue = value?.viewValue?.toLowerCase();
            this.locationName = value?.value;
        } else if (value) {
            filterValue = value.toLowerCase();
        }

        let filterResult = this.locationMockData.filter(option => option.viewValue.toLowerCase().includes(filterValue));
        if (typeof this.location.value === 'object') {
            let customerValue: any = this.location.value;
            let materialElem = this.orderDetailsForm.get('materials');

            switch (customerValue?.viewValue) {
                case 'PWF Deck': {
                    materialElem?.setValue('pwf treads, pwf stringers');
                    this.materialsDisabled = true;
                    this.selectedMaterialsField = '8';
                    
                    break;
                }

                case '5/4 PWF Deck': {
                    this.orderDetailsForm.get('materials')?.setValue('5/4" pwf treads, pwf stringers');
                    this.materialsDisabled = true;
                    this.selectedMaterialsField = '7';

                    break;
                };

                case 'Garage': {
                    this.orderDetailsForm.get('materials')?.setValue('plywood tread, spruce stingers');
                    this.selectedStairTypeField = '2';
                    this.garage$.next(true);

                    this.materialsDisabled = false;
                    this.selectedMaterialsField = '1';
                
                    break;
                };

                default: {
                    materialElem?.enable();
                    this.materialsDisabled = false;
                    this.orderDetailsForm.get('materials')?.setValue('plywood tread, spruce stingers');
                }
            }

            this.location.setValue(customerValue?.viewValue || '')
        }

        return filterResult;
    }

    nextImageStrcssWndw(): void {
        this.imageIndexStrcss = (this.imageIndexStrcss + 1) % this.imgs$.value.length;
    }
    
    prevImageStrcssWndw(): void {
        this.imageIndexStrcss = (this.imageIndexStrcss - 1 + this.imgs$.value.length) % this.imgs$.value.length;
    }

    nextImageImgsWndw(): void {
        this.imageIndexImgsWndw = (this.imageIndexImgsWndw + 1) % this.data.Images.length;
        
        this.imagePreview.set(this.data.Images[this.imageIndexImgsWndw].img);
    }
    
    prevImageImgsWndw(): void {
        this.imageIndexImgsWndw = (this.imageIndexImgsWndw - 1 + this.data.Images.length) % this.data.Images.length;
        
        this.imagePreview.set(this.data.Images[this.imageIndexImgsWndw].img);
    }

    numberFieldChanged(e: any) {
        console.log('--DEBUG-- number input changed: ', e.target.value);
        if (!e.target.value) {
            this.orderDetailsForm.get(e.target.id)?.setValue(0);
            return;
        } 

        if (e.target.id === 'riseCount') {
            let numberRiseOfStairs = Number(this.orderDetailsForm.get('riseCount')?.value);
            
            if (Number(numberRiseOfStairs) !== Number(e.target.value)) this.riseCountWasChanged = true;
        }

        this.orderDetailsForm.get(e.target.id)?.setValue(Number(eval(e.target.value)).toFixed(3));

        this.reCalculateEverything();
    }

    methodChanged(e: any) {
        console.log('--DEBUG-- method changed: ', e.target.value);
        this.divisor = this.methodsData[e.target.value];

        this.orderDetailsForm.get('divisor')?.setValue(this.divisor);
        this.reCalculateEverything();
    }

    stairTypeChanged(e: any) {
        this.garage$.next(false);

        if (e.target.value === 2) {
            this.orderDetailsForm.get('materials')?.setValue('plywood tread, spruce stingers');
            this.selectedStairTypeField = '2';
            this.garage$.next(true);

            this.materialsDisabled = false;
            this.selectedMaterialsField = '1';
        }
        console.log('--DEBUG-- stair type changed: ', e.target.value);
    }

    headroomMattersChanged(e: any) {
        console.log('--DEBUG-- headroom matters changed: ', e.checked);
        if (e.checked) {
            this.headroomMatters$.next(true);
        } else {
            this.headroomMatters$.next(false);
        }
    }

    offTheTopChanged(e: any) {
        console.log('--DEBUG-- off the top changed: ', e.checked);
        if (e.checked) {
            this.offTheTop$.next(true);
            this.orderDetailsForm.get('offTheTopVal')?.setValue(-0.375);
        } else {
            this.offTheTop$.next(false);
            this.orderDetailsForm.get('offTheTopVal')?.setValue(0);
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
        try {
            let res = await this.ordersService.createImage(this.data.ID, {
                imagedata: this.imageBlob,
                originalfilename: this.imageName(),
                orderNum: this.data.OrderNum,
                description: 'test',
                imagetext: this.imageName()
            });
    
            console.log('--DEBUG-- upload: ', res);
            if (res.status === 'ok') {
                this.dialogRef.close('reopen');
            } else {
                this.imageUploadingFailedLabel$.next(true);
            }
        } catch (err: any) {
            this.loading$.next(false);
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }

    changeFields(e: any) {
        this.orderDetailsForm.get('sectionType')?.setValue(this.selectedSectionTypeField);
        console.log('--DEBUG-- select was changed ', this.orderDetailsForm.get('sectionType')?.value);
        this.sectionType$.next(this.orderDetailsForm.get('sectionType')?.value || '');
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
                console.log('--DEBUG-- uploaded img: ', e?.target?.result);
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

        try {
            await this.ordersService.removeImage(this.data.ID, this.data.Images[this.imageIndexImgsWndw].id);

            this.dialogRef.close('reopen');
        } catch (err: any) {
            this.loading$.next(false);
            this.dialog.open(ErrorDialogWindow, {
                data: {
                    errorMessage: err.error
                }
            });
        }
    }
}
