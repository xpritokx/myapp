import { ChangeDetectionStrategy, Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { DomSanitizer } from '@angular/platform-browser';

import { ErrorDialogWindow } from '../../error/error-dialog.component';

import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

import { ImagesService } from '../../../services/images.service';
@Component({
    selector: 'print-order',
    templateUrl: './print-order.component.html',
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
    styleUrls: ['./print-order.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintOrderComponent implements OnInit {
    readonly dialog = inject(MatDialog);
    readonly sanitizer = inject(DomSanitizer);
    readonly imagesService = inject(ImagesService);
    
    public loading$ = new BehaviorSubject<boolean>(false);
    
    tabChangedObj: {
        [key: number]: string
    } = {
        0: 'workorder',
        1: 'cuttingList',
        2: 'salesOrder',
        3: 'shippingManifest'
    };

    currentOrder: any;
    workorderPdfBytes: any;
    cuttingListPdfBytes: any;
    salesOrderPdfBytes: any;
    shippingManifestPdfBytes: any;
    safePdfUrlWorkorders: any;
    safePdfUrlCuttingList: any;
    safePdfUrlSalesOrder: any;
    safePdfUrlShippingManifest: any;
    safePdfSectionName: 'workorderPdfBytes' | 'cuttingListPdfBytes' | 'salesOrderPdfBytes' | 'shippingManifestPdfBytes';

    landingTypeImagesObj: any = {};

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<any>,
    ) {
        let landingTypeImages: any[] = [];

        this.currentOrder = data;
        this.safePdfSectionName = 'workorderPdfBytes';

        landingTypeImages = this.imagesService.getSavedDefaultImages('landing_type_images');
        landingTypeImages.forEach((landingTypeImage: any) => {
            this.landingTypeImagesObj[landingTypeImage.ImageText] = landingTypeImage.Image;
        });
    
    }

    ngOnInit() {
        this.createWorkordersPDF();
        this.createCuttingListPDF();
        this.createSalesOrderPDF();
        this.createShippingManifestPDF();
    }

    splitBy2(text: string, sign: string) {
        let splitedLocation = text.split(sign);
        let splitedIndex = Math.round(splitedLocation.length / 2);
        let text1 = splitedLocation.slice(0, splitedIndex).join(' ');
        let text2 = splitedLocation.slice(splitedIndex, splitedLocation.length -1).join(' ');
        
        return [
            text1,
            text2,
        ];
    }

    summarizer(arr: any[], fieldName: string) {
        return arr.reduce((t: number, arrItem: any) => {
            console.log('--DEBUG-- fieldName: ', arrItem[fieldName]);

            return t + arrItem[fieldName];
        }, 0);
    }

    base64ToArrayBuffer(base64: string) {
        //return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        var binaryString = atob(base64);
        var bytes = new Uint8Array(binaryString.length);
        for (var i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    formatPrice(price: number): string {
        return `$${price.toFixed(2)}`;
    }

    decimalToMixedFraction(decimal: number): string {
        if (Number.isInteger(decimal)) return decimal.toString(); // Return whole numbers directly
    
        const isNegative = decimal < 0;
        const absoluteDecimal = Math.abs(decimal);
        
        const wholePart = Math.floor(absoluteDecimal); // Take only absolute whole part
        let fractionalPart = absoluteDecimal - wholePart;
    
        const tolerance = 1e-9; // Small tolerance for floating-point precision issues
        const maxDenominator = 128; // Limit denominator size for reasonable fractions
    
        let bestNumerator = 0, bestDenominator = 1;
        let minDifference = Number.MAX_VALUE;
    
        for (let denom = 2; denom <= maxDenominator; denom++) {
            const num = Math.round(fractionalPart * denom);
            const approxValue = num / denom;
            const difference = Math.abs(fractionalPart - approxValue);
    
            if (difference < minDifference - tolerance) {
                bestNumerator = num;
                bestDenominator = denom;
                minDifference = difference;
            }
        }
    
        // Reduce the fraction using the greatest common divisor (GCD)
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    
        const divisor = gcd(bestNumerator, bestDenominator);
        bestNumerator /= divisor;
        bestDenominator /= divisor;
    
        // If the fraction reduces to 0 (e.g., whole numbers)
        if (bestNumerator === 0) return (isNegative ? "-" : "") + wholePart.toString();
    
        // Ensure correct sign placement
        let result = bestNumerator === bestDenominator
            ? (wholePart + 1).toString() // Handle cases like 1 4/4 -> 2
            : `${wholePart} ${bestNumerator}/${bestDenominator}`;
    
        if (result.length > 1 && result[0] === '0' && result[1] === ' ') {
            result = result.substr(2);
        }

        return isNegative ? `-${result}` : result;
    }

    pieceMaker(value: number) {
        let res = value === 1 ? 'piece' : 'pieces'
        return value < 10 ? ` ${res}` : res;
    }

    async createWorkordersPDF() {
        console.log('--DEBUG-- create PDF');
        const pdfDoc = await PDFDocument.create();
        const titleCourierFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
        const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const titleFontSize = 24;
        const tableFontSize = 10;
        const imageLabelSize = 16;
        const fontSize = 12;

        page.setRotation(degrees(90));

        if (this.data.quote) {
            page.drawText(`QUOTE ONLY. DO NOT MANUFACTURE     No.  ${this.data.data.OrderNum}`, {
                x: 35,
                y: height - 700,
                size: titleFontSize,
                font: titleCourierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
        } else {
            page.drawText(`Work Order          No.  ${this.data.data.OrderNum}`, {
                x: 35,
                y: height - 500,
                size: titleFontSize,
                font: titleCourierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
        }

        page.drawLine({
            start: { x: 50, y: 30 },
            end: { x: 50, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Customer: ${this.data.data.Customer}`, {
            x: 70,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Purchase Order #: None`, {
            x: 70,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Address: ${this.data.data.Address}`, {
            x: 90,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Order Date: ${this.data.data.OrderDate}`, {
            x: 90,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Job #: ${this.data.data.JobNum}`, {
            x: 110,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Delivery Date: ${this.data.data.DeliveryDate}`, {
            x: 110,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Model: ${this.data.data.Model}`, {
            x: 130,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Input By: ${this.data.data.InputBy}`, {
            x: 130,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawLine({
            start: { x: 140, y: 30 },
            end: { x: 140, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Type         Location         # of Risers     Rise     Run     Adj.Rise     OSM     Stringers     Str.Style`, {
            x: 160,
            y: height - 800,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawLine({
            start: { x: 170, y: 30 },
            end: { x: 170, y: 810 },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        let heightOfDocument = 170;
        let location: string;
        let extended = 0;

        this.data.orders.forEach((order: any) => {
            extended = 0;
            heightOfDocument += 15;

            page.drawText(`${order.StairNum}.`, {
                x: heightOfDocument,
                y: height - 830,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            page.drawText(`${order.SectionType}`, {
                x: heightOfDocument,
                y: height - 805,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            location = order.SectionType === 'Winder' ? order.WinderLocation : order.Location;

            if (order.SectionType === 'Winder' || order.SectionType === 'Landing') {
                if (order.SectionType === 'Winder' || order.blurb_winder) {
                    if (location?.length >= 20) {
                        let locationArr = this.splitBy2(location, ' ');
        
                        extended = 10;
        
                        page.drawText(`${locationArr[0]}`, {
                            x: heightOfDocument,
                            y: height - 730,
                            size: tableFontSize,
                            font: courierFont,
                            color: rgb(0, 0, 0),
                            rotate: degrees(90)
                        });
                        page.drawText(`${locationArr[1]}`, {
                            x: heightOfDocument + 13,
                            y: height - 730,
                            size: tableFontSize,
                            font: courierFont,
                            color: rgb(0, 0, 0),
                            rotate: degrees(90)
                        });
                    } else {
                        page.drawText(`  ${location}`, {
                            x: heightOfDocument,
                            y: height - 730,
                            size: tableFontSize,
                            font: courierFont,
                            color: rgb(0, 0, 0),
                            rotate: degrees(90)
                        });
                    }
                    
                    page.drawText(`${order.NumRisers}`, {
                        x: heightOfDocument,
                        y: height - 545,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });

                    page.drawText(`${order.blurb_winder.replace(/\\n/g, '')}`, {
                        x: heightOfDocument,
                        y: height - 475,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0.53, 0, 0),
                        rotate: degrees(90)
                    });
                }

                if (order.SectionType === 'Landing' || order.blurb_landing) {
                    page.drawText(`${order.blurb_landing.replace(/\\n/g, '')}`, {
                        x: heightOfDocument,
                        y: height - 730,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0.53, 0, 0),
                        rotate: degrees(90)
                    });
                }
            } else {
                if (location?.length >= 20) {
                    let locationArr = this.splitBy2(location, ' ');
    
                    extended = 10;
    
                    page.drawText(`${locationArr[0]}`, {
                        x: heightOfDocument,
                        y: height - 730,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                    page.drawText(`${locationArr[1]}`, {
                        x: heightOfDocument + 13,
                        y: height - 730,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                } else {
                    page.drawText(`  ${location}`, {
                        x: heightOfDocument,
                        y: height - 730,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                }
    
                page.drawText(`${order.NumRisers}`, {
                    x: heightOfDocument,
                    y: height - 545,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.RiseOfStair)}`, {
                    x: heightOfDocument,
                    y: height - 475,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                let run = this.decimalToMixedFraction(order.StairRun);
    
                if (order.StairType === 2) {
                    run = '(2x10)';
                }
    
                if (order.StairType === 3) {
                    run = '(2x6)';
                }
    
                page.drawText(`${run}`, {
                    x: heightOfDocument,
                    y: height - 410,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                let adjRise = `${this.decimalToMixedFraction(order.AdjRise)}`;
    
                if (adjRise === '-1/32') adjRise = '-1/16';

                if (order.StairType === 2 && order.AdjRise) {
                    adjRise = `${adjRise} T`;
                } else if (order.AdjRise) {
                    adjRise = `${adjRise} B & T`;
                }
        
                if (adjRise.length < 8) {
                    adjRise = `   ${adjRise}`
                }
    
                page.drawText(adjRise, {
                    x: heightOfDocument,
                    y: height - 350,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.OSM)}`, {
                    x: heightOfDocument,
                    y: height - 250,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${order.NumStringers}`, {
                    x: heightOfDocument,
                    y: height - 165,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${order.StringerStyle}`, {
                    x: heightOfDocument,
                    y: height - 100,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });   
            }

            let comment = order.WorkorderComments || order.OrderType;

            comment = comment.replace(/(\r\n|\n|\r)/gm,'')

            if (comment) {
                page.drawText(`${comment}`, {
                    x: heightOfDocument + extended + 13,
                    y: height - 805,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0.53, 0),
                    rotate: degrees(90)
                });
            }

            heightOfDocument += 20 + extended;

            page.drawLine({
                start: { x: heightOfDocument, y: 30 },
                end: { x: heightOfDocument, y: 810 },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
        });

        page.drawLine({
            start: { x: heightOfDocument, y: 30 },
            end: { x: heightOfDocument, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        let image: any;
        let dims;
        let imagesDistance = 0;
        let imageHeight = 570;
        let imageLabelHeight = 585;
        let imageRowCount = 0;
        let imageCount = 0;

        if (heightOfDocument >= 435) {
            page = pdfDoc.addPage();
            page.setRotation(degrees(90));

            imageHeight = 150;
            imageLabelHeight = 165;
            heightOfDocument = 35;
        } else {
            imageCount = 8;
        }

        for (let order of this.data.orders) {
            let straightLanding = false;

            if (
                order.SectionType === 'Landing' &&
                order.StringerStyle1 === 1212
            ) straightLanding = true;

            if (order.Images?.length) {
                for (let img of order.Images) {
                    try {
                        if (straightLanding && img.text.includes('LANDING')) {
                            console.log('--DEBUG-- straightLanding: ', img);
                            img.img = this.landingTypeImagesObj['LANDINGSTR'];
                        }

                        if (img.img && img.img.indexOf('image/png') !== -1) {
                            console.log('--DEBUG-- 1 png');
                            image = await pdfDoc.embedPng(this.base64ToArrayBuffer(img.img.split(',')[1]));
                        } else {
                            console.log('--DEBUG-- 1 jpg');
                            image = await pdfDoc.embedJpg(this.base64ToArrayBuffer(img.img.split(',')[1]));
                        }

                        if (imageRowCount >= 4) {
                            imageRowCount = 0;
                            imageHeight += 175;
                            imageLabelHeight += 175;
                            imagesDistance = 0;
                        }
                        imageRowCount++;
                        imageCount++;
    
                        dims = image.scale(0.6);
    
                        if (dims.height > 150) {
                            dims.height = 150;
                            dims.width = 130;
                        }
    
                        page.drawImage(image, {
                            x: imageHeight,
                            y: height - 805 + imagesDistance,
                            width: dims.width,
                            height: dims.height,
                            rotate: degrees(90),
                        });
    
                        page.drawText(`Custom ${order.StairNum}`, {
                            x: imageLabelHeight,
                            y: height - 805 + imagesDistance,
                            size: imageLabelSize,
                            font: titleCourierFont,
                            color: rgb(0, 0, 0),
                            rotate: degrees(90)
                        });
    
                        imagesDistance += 200;

                        if (imageCount >= 12) {
                            page = pdfDoc.addPage();
                            page.setRotation(degrees(90));
                
                            imageHeight = 150;
                            imageLabelHeight = 165;
                            heightOfDocument = 35;
                            imageCount = 0;
                            imageRowCount = 0;
                            imagesDistance = 0;
                        }
                    } catch (err) {
                        console.log('--DEBUG--  img err: ', err);
                        this.dialog.open(ErrorDialogWindow, {
                            data: {
                                errorMessage: err
                            }
                        });
                        
                        continue;
                    }
                }
            }
        }

        this.workorderPdfBytes = await pdfDoc.saveAsBase64();
        let pdfUrl = "data:application/pdf;base64," + encodeURI(this.workorderPdfBytes)
        
        console.log('--DEBUG-- pdfUrl workorders: ', pdfUrl)

        try {
            this.safePdfUrlWorkorders = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
        } catch(err) {
            console.log('--DEBUG-- workorders sanitize error: ', err);
        }
    }

    async createCuttingListPDF() {
        console.log('--DEBUG-- create PDF cutting list');
        const pdfDoc = await PDFDocument.create();
        const titleCourierFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
        const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
        const courierFontOblique = await pdfDoc.embedFont(StandardFonts.CourierOblique);

        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const titleFontSize = 24;
        const tableFontSize = 10;
        const imageLabelSize = 16;
        const fontSize = 12;

        page.setRotation(degrees(90));

        if (this.data.quote) {
            page.drawText(`QUOTE ONLY. DO NOT MANUFACTURE     No.  ${this.data.data.OrderNum}`, {
                x: 35,
                y: height - 700,
                size: titleFontSize,
                font: titleCourierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
        } else {
            page.drawText(`Cutting List         No.  ${this.data.data.OrderNum}`, {
                x: 35,
                y: height - 500,
                size: titleFontSize,
                font: titleCourierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
        }

        page.drawLine({
            start: { x: 50, y: 30 },
            end: { x: 50, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Customer: ${this.data.data.Customer}`, {
            x: 70,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Purchase Order #: None`, {
            x: 70,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Address: ${this.data.data.Address}`, {
            x: 90,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Order Date: ${this.data.data.OrderDate}`, {
            x: 90,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Job #: ${this.data.data.JobNum}`, {
            x: 110,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Delivery Date: ${this.data.data.DeliveryDate}`, {
            x: 110,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Model: ${this.data.data.Model}`, {
            x: 130,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Input By: ${this.data.data.InputBy}`, {
            x: 130,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawLine({
            start: { x: 140, y: 30 },
            end: { x: 140, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Consolidated Cutting List`, {
            x: 160,
            y: height - 500,
            size: fontSize,
            font: titleCourierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        let stairs = this.data.orders.filter((o: any) => {
            if (o.SectionType === 'Stair') return true;

            return false;
        });

        let heightOfDocument = 180;
        let treadWidth;

        let cutOrderInfo = (hghtOfDcmnt: number, strs: any, cutThePage: boolean = false, oneStair: boolean = false) => {
            let slabsNeeded: any = {};

            strs.forEach((stair: any) => {
                let numWholeSlabsNeeded = stair.numWholeSlabsNeeded;
                let width = this.decimalToMixedFraction(stair.TreadWidth);
                let extraTreadsNeeded = stair.NumTreads;

                let key = width.toString();

                console.log('--DEBUG-- stair.RiserType: ', stair.RiserType);
                console.log('--DEBUG-- treads data: ', {
                    key,
                    stairType: stair.StairType,
                    extraTreadsNeeded: extraTreadsNeeded,
                    numWholeSlabsNeeded: numWholeSlabsNeeded
                });

                if (!slabsNeeded[key]) slabsNeeded[key] = {
                    numWholeSlabsNeeded: 0,
                    width,
                    extraTreadsNeeded: 0
                };
                
                let numWholeSlabsNeededNmbr = slabsNeeded[key].numWholeSlabsNeeded + numWholeSlabsNeeded;
                let extraTreadsNeededNmbr = slabsNeeded[key].extraTreadsNeeded + extraTreadsNeeded;

                slabsNeeded[key].numWholeSlabsNeeded = numWholeSlabsNeededNmbr;
                slabsNeeded[key].extraTreadsNeeded = extraTreadsNeededNmbr;
            });

            if (Object.keys(slabsNeeded).length) {
                page.drawText(`SLABS NEEDED FOR TREADS:`, {
                    x: hghtOfDcmnt,
                    y: height - 800,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            }

            Object.keys(slabsNeeded).forEach((slabsNeededKey: any) => {
                page.drawText(`${slabsNeeded[slabsNeededKey].numWholeSlabsNeeded}`, {
                    x: hghtOfDcmnt,
                    y: height - 620,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText('width', {
                    x: hghtOfDcmnt,
                    y: height - 520,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                treadWidth = this.decimalToMixedFraction(slabsNeeded[slabsNeededKey].TreadWidth);
    
                page.drawText(slabsNeeded[slabsNeededKey].width, {
                    x: hghtOfDcmnt,
                    y: height - 470,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText('Plus extra Treads needed:', {
                    x: hghtOfDcmnt,
                    y: height - 360,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${slabsNeeded[slabsNeededKey].extraTreadsNeeded}`, {
                    x: hghtOfDcmnt,
                    y: height - 160,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                hghtOfDcmnt += 15;
            });
    
            let halfInchSlabsNeeded: any = {};

            strs.forEach((stair: any) => {
                let numWholeSlabsNeededTotal = stair.numWholeSlabsNeededTotal;
                let width = this.decimalToMixedFraction(stair.RiserWidth);
                let numExtraRisersNeeded = stair.numExtraRisersNeeded;

                let key = width.toString();

                if (stair.RiserType !== 2) {
                    console.log('--DEBUG-- treads data: ', {
                        key,
                        stairType: stair.StairType,
                        numExtraRisersNeeded: numExtraRisersNeeded,
                        numWholeSlabsNeededTotal: numWholeSlabsNeededTotal
                    });
    
                    if (!halfInchSlabsNeeded[key]) halfInchSlabsNeeded[key] = {
                        numWholeSlabsNeededTotal: 0,
                        width,
                        numExtraRisersNeeded: 0
                    };
                    
                    let numWholeSlabsNeededTotalNmbr = halfInchSlabsNeeded[key].numWholeSlabsNeededTotal + numWholeSlabsNeededTotal;
                    let numExtraRisersNeededNmbr = halfInchSlabsNeeded[key].numExtraRisersNeeded + numExtraRisersNeeded;

                    halfInchSlabsNeeded[key].numWholeSlabsNeededTotal = numWholeSlabsNeededTotalNmbr;
                    halfInchSlabsNeeded[key].numExtraRisersNeeded = numExtraRisersNeededNmbr;
                }
            });

            if (Object.keys(halfInchSlabsNeeded).length) {
                page.drawText(`1/2" RISER SLABS needed:`, {
                    x: hghtOfDcmnt,
                    y: height - 800,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            }

            Object.keys(halfInchSlabsNeeded).forEach((halfInchSlabsNeededKey: any) => {
                let numWholeSlabsNeededTotal = halfInchSlabsNeeded[halfInchSlabsNeededKey].numWholeSlabsNeededTotal;
                let riserWidth = halfInchSlabsNeeded[halfInchSlabsNeededKey].width;

                page.drawText(`${numWholeSlabsNeededTotal}`, {
                    x: hghtOfDcmnt,
                    y: height - 620,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText('width', {
                    x: hghtOfDcmnt,
                    y: height - 520,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                treadWidth = riserWidth;
    
                page.drawText(treadWidth, {
                    x: hghtOfDcmnt,
                    y: height - 470,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText('Plus extra Risers needed:', {
                    x: hghtOfDcmnt,
                    y: height - 360,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${halfInchSlabsNeeded[halfInchSlabsNeededKey].numExtraRisersNeeded}`, {
                    x: hghtOfDcmnt,
                    y: height - 160,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                hghtOfDcmnt += 15;
            });
    
            if (oneStair) {
                page.drawText(`LEFTOVER from tread slabs:                           One slab (below)                   All slabs(below)`, {
                    x: hghtOfDcmnt,
                    y: height - 800,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                hghtOfDcmnt += 15;
        
                page.drawText(`# standart risers can be made:                      ${strs[0].TreadLeftoverStdRisers}                         ${strs[0].AllSlabsLeftoverStdRisers}`, {
                    x: hghtOfDcmnt,
                    y: height - 700,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
                
                hghtOfDcmnt += 15;
        
                page.drawText(`# of lower risers can be made:                      ${strs[0].TreadLeftoverLowerRisers}                         ${strs[0].AllSlabsLeftoverLowerRisers}`, {
                    x: hghtOfDcmnt,
                    y: height - 700,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            } else {
                page.drawText(`LEFTOVER from tread slabs:                           #can be made`, {
                    x: hghtOfDcmnt,
                    y: height - 800,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                hghtOfDcmnt += 15;
        
                page.drawText(`# standart risers can be made:`, {
                    x: hghtOfDcmnt,
                    y: height - 700,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
                
                hghtOfDcmnt += 15;
        
                page.drawText(`# of lower risers can be made:`, {
                    x: hghtOfDcmnt,
                    y: height - 700,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            }
            
    
            hghtOfDcmnt += 25;
    
            if (hghtOfDcmnt > 500 && cutThePage) {
                page = pdfDoc.addPage();
                page.setRotation(degrees(90));
    
                hghtOfDcmnt = 35;
            }
    
            let treads: any = {};

            strs.forEach((stair: any) => {
                if (stair.NumTreads < 0) stair.NumTreads = 0; 

                let tW = stair.TreadWidth;
                let run = this.decimalToMixedFraction(stair.TreadRun);


                if (stair.StairType === 2) {
                    run = '(2x10)';
                }

                if (stair.StairType === 3) {
                    run = '(2x6)';
                }

                let key = tW.toString() + run.toString();

                console.log('--DEBUG-- treads data: ', {
                    key,
                    stairType: stair.StairType,
                    numRisersNeeded: stair.NumTreads,
                    run: run
                });

                if (!treads[key]) treads[key] = {
                    pieces: 0,
                    width: tW,
                    run: run
                };
                
                let pieces = treads[key].pieces + stair.NumTreads;

                treads[key].pieces = pieces;
            });

            if (oneStair) {
                if (Object.keys(treads).length) {
                    let treadsName = strs[0].TreadType;
                    let distance = 685;

                    if (strs[0].Location === 'Garage') {
                        distance = 670;
                    }

                    if (strs[0].Location === 'Deck') {
                        distance = 670;
                    }

                    page.drawText(`${treadsName}:`, {
                        x: hghtOfDcmnt,
                        y: height - distance,
                        size: fontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                }
            } else {
                if (Object.keys(treads).length) {
                    page.drawText(`Treads:`, {
                        x: hghtOfDcmnt,
                        y: height - 650,
                        size: fontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                }
            }
            
            Object.keys(treads).forEach((tread: any) => {
                page.drawText(`${treads[tread].pieces} ${this.pieceMaker(treads[tread].pieces)}`, {
                    x: hghtOfDcmnt,
                    y: height - 550,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`Run:   ${treads[tread].run}`, {
                    x: hghtOfDcmnt,
                    y: height - 450,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`width:   ${this.decimalToMixedFraction(treads[tread].width)}`, {
                    x: hghtOfDcmnt,
                    y: height - 250,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                hghtOfDcmnt += 15;
            });

    
            if (hghtOfDcmnt > 500 && cutThePage) {
                page = pdfDoc.addPage();
                page.setRotation(degrees(90));
    
                hghtOfDcmnt = 35;
            }

            let risers: any = {};
    
            strs.forEach((stair: any) => {
                if (Number(stair.RiserType) === 1 || Number(stair.RiserType) === 3) {
                    let numStdRisers = stair.NumStdRisers;
                    let cutRise = this.decimalToMixedFraction(stair.CutRise);
                    let rW = this.decimalToMixedFraction(stair.RiserWidth);

                    let key = rW.toString() + cutRise.toString();

                    console.log('--DEBUG-- risers data: ', {
                        key,
                        stairType: stair.StairType,
                        numStdRisers,
                        cutRise,
                        rW
                    });

                    if (stair.StairType !== 2 && stair.StairType !== 3) {
                        if (!risers[key]) risers[key] = {
                            pieces: 0,
                            width: rW,
                            rise: cutRise
                        };
                        
                        let pieces = risers[key].pieces + numStdRisers;

                        risers[key].pieces = pieces;   
                    }
                }
            });

            if (Object.keys(risers).length) {
                page.drawText(`RISERS Standart:`, {
                    x: hghtOfDcmnt,
                    y: height - 700,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            }

            Object.keys(risers).forEach((riser: any) => {
                page.drawText(`${risers[riser].pieces} ${this.pieceMaker(risers[riser].pieces)}`, {
                    x: hghtOfDcmnt,
                    y: height - 550,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`Rise:   ${risers[riser].rise}`, {
                    x: hghtOfDcmnt,
                    y: height - 450,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`width:   ${risers[riser].width}`, {
                    x: hghtOfDcmnt,
                    y: height - 250,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                hghtOfDcmnt += 15;
            });
    
            if (hghtOfDcmnt > 500 && cutThePage) {
                page = pdfDoc.addPage();
                page.setRotation(degrees(90));
    
                hghtOfDcmnt = 35;
            }
    
            let bottomRisers: any = {};

            strs.forEach((stair: any) => {
                if (Number(stair.RiserType) === 1 || Number(stair.RiserType) === 3) {
                    let rW = this.decimalToMixedFraction(stair.RiserWidth);
                    let rise = this.decimalToMixedFraction(stair.CutBottomRise);

                    let key = rW.toString() + rise.toString();

                    if (stair.StairType !== 2 && stair.StairType !== 3) {
                        if (!bottomRisers[key]) bottomRisers[key] = {
                            pieces: 0,
                            width: rW,
                            rise
                        };
                        
                        let pieces = bottomRisers[key].pieces + 1;

                        bottomRisers[key].pieces = pieces;   
                    }
                }
            });

            if (Object.keys(bottomRisers).length) {
                page.drawText(`Bottom RISERS:`, {
                    x: hghtOfDcmnt,
                    y: height - 690,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            }

            Object.keys(bottomRisers).forEach((bottomRiser: any) => {
                page.drawText(`${bottomRisers[bottomRiser].pieces} ${this.pieceMaker(bottomRisers[bottomRiser].pieces)}`, {
                    x: hghtOfDcmnt,
                    y: height - 550,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`Rise:   ${bottomRisers[bottomRiser].rise}`, {
                    x: hghtOfDcmnt,
                    y: height - 450,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`width:   ${bottomRisers[bottomRiser].width}`, {
                    x: hghtOfDcmnt,
                    y: height - 250,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                hghtOfDcmnt += 15;
            });
    
            if (hghtOfDcmnt > 500 && cutThePage) {
                page = pdfDoc.addPage();
                page.setRotation(degrees(90));
    
                hghtOfDcmnt = 35;
            }
    
            let topRisers: any = {};

            strs.forEach((stair: any) => {
                let topW = this.decimalToMixedFraction(stair.CalcWidth);
                let rise = this.decimalToMixedFraction(stair.CutTopRise);

                let key = topW.toString() + rise.toString();

                if (!topRisers[key]) topRisers[key] = {
                    pieces: 0,
                    width: topW,
                    rise,
                    orderType: stair.OrderType.replace('*', '')
                };
                
                let pieces = topRisers[key].pieces + 1;

                topRisers[key].pieces = pieces;
            });

            if (Object.keys(topRisers).length) {
                page.drawText(`TOP RISER:`, {
                    x: hghtOfDcmnt,
                    y: height - 665,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            }

            Object.keys(topRisers).forEach((topRiser: any) => {
                page.drawText(`${topRisers[topRiser].pieces} ${this.pieceMaker(topRisers[topRiser].pieces)}`, {
                    x: hghtOfDcmnt,
                    y: height - 550,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`Rise:   ${topRisers[topRiser].rise}`, {
                    x: hghtOfDcmnt,
                    y: height - 450,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`width:   ${topRisers[topRiser].width}`, {
                    x: hghtOfDcmnt,
                    y: height - 250,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                page.drawText(`${topRisers[topRiser].orderType}`, {
                    x: hghtOfDcmnt,
                    y: height - 120,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                hghtOfDcmnt += 15;
            });

            return hghtOfDcmnt;
        }

        console.log('--DEBUG-- cutOrderInfo stairs: ', stairs);
        heightOfDocument = cutOrderInfo(heightOfDocument, stairs, true);

        page.drawText('Note: If there are any discrepancies between consolidated list and individual job lists please', {
            x: heightOfDocument,
            y: height - 750,
            size: fontSize,
            font: courierFontOblique,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 15;

        page.drawText('consult Mike or John and report this bug immediately.', {
            x: heightOfDocument,
            y: height - 600,
            size: fontSize,
            font: courierFontOblique,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 15;

        page.drawLine({
            start: { x: heightOfDocument, y: 30 },
            end: { x: heightOfDocument, y: 810 },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        heightOfDocument += 15;

        if (heightOfDocument > 500) {
            page = pdfDoc.addPage();
            page.setRotation(degrees(90));

            heightOfDocument = 35;
        }

        this.data.orders.forEach((order: any) => {
            page.drawText(`#${order.StairNum}`, {
                x: heightOfDocument,
                y: height - 810,
                size: fontSize,
                font: titleCourierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            if (order.SectionType === 'Landing') {
                page.drawText(`${order.blurb_landing}`, {
                    x: heightOfDocument,
                    y: height - 730,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            } else {
                page.drawText(`Location`, {
                    x: heightOfDocument,
                    y: height - 750,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${order.Location}`, {
                    x: heightOfDocument,
                    y: height - 650,
                    size: imageLabelSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            }

            heightOfDocument += 25;

            if (order.SectionType === 'Winder') {
                page.drawText(`1"PLY:`, {
                    x: heightOfDocument,
                    y: height - 650,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${1} ${this.pieceMaker(1)}`, {
                    x: heightOfDocument,
                    y: height - 600,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                page.drawText(`run:`, {
                    x: heightOfDocument,
                    y: height - 500,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.winder_OneInchTreadRun)}`, {
                    x: heightOfDocument,
                    y: height - 450,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                page.drawText(`width:`, {
                    x: heightOfDocument,
                    y: height - 350,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.winder_OneInchTreadWidth)}`, {
                    x: heightOfDocument,
                    y: height - 300,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                heightOfDocument += 25;

                page.drawText(`RISERS 1/2":`, {
                    x: heightOfDocument,
                    y: height - 695,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${order.winder_WinderRisers} ${this.pieceMaker(order.winder_WinderRisers)}`, {
                    x: heightOfDocument,
                    y: height - 600,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                page.drawText(`rise:`, {
                    x: heightOfDocument,
                    y: height - 500,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.RiseOfStair)}`, {
                    x: heightOfDocument,
                    y: height - 450,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                page.drawText(`width:`, {
                    x: heightOfDocument,
                    y: height - 350,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.winder_StepTwoStartWidth + 2)}?`, {
                    x: heightOfDocument,
                    y: height - 300,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                heightOfDocument += 25;

                page.drawText(`Bottom Riser, 2x10:`, {
                    x: heightOfDocument,
                    y: height - 745,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`1 ${this.pieceMaker(1)}`, {
                    x: heightOfDocument,
                    y: height - 600,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                page.drawText(`rise:`, {
                    x: heightOfDocument,
                    y: height - 500,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.winder_BottomRiserRise)}`, {
                    x: heightOfDocument,
                    y: height - 450,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                page.drawText(`width:`, {
                    x: heightOfDocument,
                    y: height - 350,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.winder_OnThreePlusSix)}`, {
                    x: heightOfDocument,
                    y: height - 300,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                page.drawText(`${order.OrderType.replace('*', '')}`, {
                    x: heightOfDocument,
                    y: height - 200,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });

                heightOfDocument += 25;
            }

            if (order.SectionType === 'Stair') {
                heightOfDocument = cutOrderInfo(heightOfDocument, [order], false,  true);
            }

            page.drawLine({
                start: { x: heightOfDocument, y: 30 },
                end: { x: heightOfDocument, y: 810 },
                thickness: 1,
                color: rgb(0, 0, 0),
            });

            if (heightOfDocument > 450) {
                page = pdfDoc.addPage();
                page.setRotation(degrees(90));
    
                heightOfDocument = 35;
            }

            heightOfDocument += 15;
        });

        this.cuttingListPdfBytes = await pdfDoc.saveAsBase64();
        let pdfUrl = "data:application/pdf;base64," + encodeURI(this.cuttingListPdfBytes)
        
        console.log('--DEBUG-- pdfUrl cutting list: ', pdfUrl)

        try {
            this.safePdfUrlCuttingList  = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
        } catch(err) {
            console.log('--DEBUG-- cutting list sanitize error: ', err);
        }
    }

    async createSalesOrderPDF() {
        console.log('--DEBUG-- create sales order PDF');
        const pdfDoc = await PDFDocument.create();
        const titleCourierFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
        const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const titleFontSize = 24;
        const tableFontSize = 10;
        const imageLabelSize = 16;
        const fontSize = 12;

        page.setRotation(degrees(90));

        if (this.data.quote) {
            page.drawText(`QUOTE ONLY. DO NOT MANUFACTURE     No.  ${this.data.data.OrderNum}`, {
                x: 35,
                y: height - 700,
                size: titleFontSize,
                font: titleCourierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
        } else {
            page.drawText(`Sales Order         No.  ${this.data.data.OrderNum}`, {
                x: 35,
                y: height - 500,
                size: titleFontSize,
                font: titleCourierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
        }

        page.drawLine({
            start: { x: 50, y: 30 },
            end: { x: 50, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Customer: ${this.data.data.Customer}`, {
            x: 70,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Purchase Order #: None`, {
            x: 70,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Address: ${this.data.data.Address}`, {
            x: 90,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Order Date: ${this.data.data.OrderDate}`, {
            x: 90,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Job #: ${this.data.data.JobNum}`, {
            x: 110,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Delivery Date: ${this.data.data.DeliveryDate}`, {
            x: 110,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Model: ${this.data.data.Model}`, {
            x: 130,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Input By: ${this.data.data.InputBy}`, {
            x: 130,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawLine({
            start: { x: 140, y: 30 },
            end: { x: 140, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Item No.      Ordered       Unit     Description                        Tax     Unit Price        Amount`, {
            x: 160,
            y: height - 800,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawLine({
            start: { x: 170, y: 30 },
            end: { x: 180, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        let heightOfDocument = 170;
        let extended = 0;

        this.data.salesOrders.forEach((order: any) => {
            heightOfDocument += 20;

            page.drawText(`${order.PriceCode}`.toUpperCase(), {
                x: heightOfDocument,
                y: height - 800,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            page.drawText(`${order.Qty}`, {
                x: heightOfDocument,
                y: height - 680,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            page.drawText(`${order.Unit}`, {
                x: heightOfDocument,
                y: height - 595,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            page.drawText(`${order.Description}`, {
                x: heightOfDocument,
                y: height - 530,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            page.drawText(`${order.Tax}`, {
                x: heightOfDocument,
                y: height - 270,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            page.drawText(`${this.formatPrice(order.UnitPrice)}`, {
                x: heightOfDocument,
                y: height - 200,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            page.drawText(`${this.formatPrice(order.Amount)}`, {
                x: heightOfDocument,
                y: height - 90,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
        });

        heightOfDocument += 30;

        let subtotal = this.data.salesOrders.reduce((t:number , order:any) => {
            return t + order.Amount;
        }, 0);

        page.drawText(`Subtotal`, {
            x: heightOfDocument,
            y: height - 400,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`${this.formatPrice(subtotal)}`, {
            x: heightOfDocument,
            y: height - 90,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 30;

        page.drawText(`3 - GST 5.00%`, {
            x: heightOfDocument,
            y: height - 400,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        let gst = subtotal * 0.05;

        page.drawText(`${this.formatPrice(gst)}`, {
            x: heightOfDocument,
            y: height - 90,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 30;

        page.drawLine({
            start: { x: heightOfDocument, y: 30 },
            end: { x: heightOfDocument, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        heightOfDocument += 20;

        page.drawText(`Total Amount`, {
            x: heightOfDocument,
            y: height - 250,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        let total = subtotal + gst;

        page.drawText(`${this.formatPrice(total)}`, {
            x: heightOfDocument,
            y: height - 90,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 20;

        page.drawLine({
            start: { x: heightOfDocument, y: 30 },
            end: { x: heightOfDocument, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        this.salesOrderPdfBytes = await pdfDoc.saveAsBase64();
        let pdfUrl = "data:application/pdf;base64," + encodeURI(this.salesOrderPdfBytes)
        
        console.log('--DEBUG-- pdfUrl sales order: ', pdfUrl)

        try {
            this.safePdfUrlSalesOrder = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
        } catch(err) {
            console.log('--DEBUG-- sales order sanitize error: ', err);
        }
    }

    async createShippingManifestPDF() {
        console.log('--DEBUG-- create shipping manifest PDF');
        const pdfDoc = await PDFDocument.create();
        const titleCourierFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
        const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const titleFontSize = 24;
        const tableFontSize = 10;
        const imageLabelSize = 16;
        const fontSize = 12;

        page.setRotation(degrees(90));

        if (this.data.quote) {
            page.drawText(`QUOTE ONLY. DO NOT MANUFACTURE     No.  ${this.data.data.OrderNum}`, {
                x: 35,
                y: height - 700,
                size: titleFontSize,
                font: titleCourierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
        } else {
            page.drawText(`Shipping Manifest       No.  ${this.data.data.OrderNum}`, {
                x: 35,
                y: height - 500,
                size: titleFontSize,
                font: titleCourierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
        }

        page.drawLine({
            start: { x: 50, y: 30 },
            end: { x: 50, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Customer: ${this.data.data.Customer}`, {
            x: 70,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Purchase Order #: None`, {
            x: 70,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Address: ${this.data.data.Address}`, {
            x: 90,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Order Date: ${this.data.data.OrderDate}`, {
            x: 90,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Job #: ${this.data.data.JobNum}`, {
            x: 110,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Delivery Date: ${this.data.data.DeliveryDate}`, {
            x: 110,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Model: ${this.data.data.Model}`, {
            x: 130,
            y: height - 750,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`Input By: ${this.data.data.InputBy}`, {
            x: 130,
            y: height - 350,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawLine({
            start: { x: 140, y: 30 },
            end: { x: 140, y: 810 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Location         Length      OSM       Height       Risers      Rise      Run`, {
            x: 160,
            y: height - 800,
            size: fontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawLine({
            start: { x: 170, y: 30 },
            end: { x: 170, y: 810 },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        let heightOfDocument = 170;
        let location: string;
        let extended = 0;

        this.data.orders.forEach((order: any) => {
            extended = 0;
            heightOfDocument += 15;

            page.drawText(`${order.StairNum}.`, {
                x: heightOfDocument,
                y: height - 830,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            location = order.SectionType === 'Winder' ? order.WinderLocation : order.Location;

            
            if (order.SectionType === 'Winder' || order.SectionType === 'Landing') {
                if (order.SectionType === 'Winder' && order.blurb_winder) {
                    if (location?.length >= 20) {
                        let locationArr = this.splitBy2(location, ' ');
        
                        extended = 10;
        
                        page.drawText(`${locationArr[0]}`, {
                            x: heightOfDocument,
                            y: height - 805,
                            size: tableFontSize,
                            font: courierFont,
                            color: rgb(0, 0, 0),
                            rotate: degrees(90)
                        });
                        page.drawText(`${locationArr[1]}`, {
                            x: heightOfDocument + 13,
                            y: height - 805,
                            size: tableFontSize,
                            font: courierFont,
                            color: rgb(0, 0, 0),
                            rotate: degrees(90)
                        });
                    } else {
                        page.drawText(`  ${location}`, {
                            x: heightOfDocument,
                            y: height - 805,
                            size: tableFontSize,
                            font: courierFont,
                            color: rgb(0, 0, 0),
                            rotate: degrees(90)
                        });
                    }
                    
                    page.drawText(`${order.blurb_winder.replace(/\\n/g, '')}`, {
                        x: heightOfDocument,
                        y: height - 675,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0.53, 0, 0),
                        rotate: degrees(90)
                    });
                }
    
                if (order.SectionType === 'Landing' && order.blurb_landing) {
                    page.drawText(`${order.blurb_landing.replace(/\\n/g, '')}`, {
                        x: heightOfDocument,
                        y: height - 805,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0.53, 0, 0),
                        rotate: degrees(90)
                    });
                }
            } else {
                if (location?.length >= 20) {
                    let locationArr = this.splitBy2(location, ' ');
    
                    extended = 10;
    
                    page.drawText(`${locationArr[0]}`, {
                        x: heightOfDocument,
                        y: height - 805,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                    page.drawText(`${locationArr[1]}`, {
                        x: heightOfDocument + 13,
                        y: height - 805,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                } else {
                    page.drawText(`  ${location}`, {
                        x: heightOfDocument,
                        y: height - 805,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                }
    
                page.drawText(`${this.decimalToMixedFraction(order.Length)}`, {
                    x: heightOfDocument,
                    y: height - 675,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.OSM)}`, {
                    x: heightOfDocument,
                    y: height - 590,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.Height)}`, {
                    x: heightOfDocument,
                    y: height - 520,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                let risersNum = `${this.decimalToMixedFraction(order.Qty)}`;
    
                page.drawText(risersNum, {
                    x: heightOfDocument,
                    y: height - 410,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${this.decimalToMixedFraction(order.RiseOfStair)}`, {
                    x: heightOfDocument,
                    y: height - 340,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                if (order.Location === 'Garage') {
                    page.drawText(`(2x10)`, {
                        x: heightOfDocument,
                        y: height - 275,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                } else if (order.Location === 'Deck') {
                    page.drawText(`(2x6)`, {
                        x: heightOfDocument,
                        y: height - 275,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                } else {
                    page.drawText(`${this.decimalToMixedFraction(order.StairRun)}`, {
                        x: heightOfDocument,
                        y: height - 275,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0, 0),
                        rotate: degrees(90)
                    });
                }
            }

            heightOfDocument += 20 + extended;

            page.drawLine({
                start: { x: heightOfDocument, y: 30 },
                end: { x: heightOfDocument, y: 810 },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
        });

        heightOfDocument += 20;

        if (heightOfDocument > 500 && heightOfDocument) {
            page = pdfDoc.addPage();
            page.setRotation(degrees(90));

            heightOfDocument = 35;
        }

        let stairs = this.data.orders.reduce((t: string, o: any) => {
            return t + ` ${o.StairNum},`
        }, 'Stairs');

        stairs = stairs.slice(0, stairs.length - 1);

        page.drawText(stairs, {
            x: heightOfDocument,
            y: height - 830,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 20;

        page.drawText('Total height:', {
            x: heightOfDocument,
            y: height - 700,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`${this.data.orders.reduce((t: number, o: any) => {
            return t + o.Height;
        }, 0)}`, {
            x: heightOfDocument,
            y: height - 600,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 20;

        page.drawText('# Staircases in height:', {
            x: heightOfDocument,
            y: height - 770,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`${this.data.orders.filter((o: any) => {
            return o.SectionType === 'Stair'
        }).length}`, {
            x: heightOfDocument,
            y: height - 600,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 20;

        page.drawText('# Winders and Landings in height:', {
            x: heightOfDocument,
            y: height - 830,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        page.drawText(`${this.data.orders.filter((o: any) => {
            return o.SectionType !== 'Stair'
        }).length}`, {
            x: heightOfDocument,
            y: height - 600,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 30;

        if (heightOfDocument > 500 && heightOfDocument) {
            page = pdfDoc.addPage();
            page.setRotation(degrees(90));

            heightOfDocument = 35;
        }

        page.drawText('This is the total height of stair. If this differs from your actual height, please don\'t install the stairs.', {
            x: heightOfDocument,
            y: height - 830,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 20;

        page.drawText('Please call the Stair Shoppe at (403) 295-2686 if you have any questions prior to installation.', {
            x: heightOfDocument,
            y: height - 830,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        heightOfDocument += 20;

        page.drawText(`Please have your order number handy (${this.data.data.OrderNum}).`, {
            x: heightOfDocument,
            y: height - 830,
            size: tableFontSize,
            font: courierFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90)
        });

        let image: any;
        let dims: any;
        let pdfUrl:string = '';
        let imagesDistance = 0;
        let imageHeight = 570;
        let imageLabelHeight = 585;
        let imageRowCount = 0;
        let imageCount = 0;

        console.log('--DEBUG-- heightOfDocument, shipping manifest: ', heightOfDocument);
        if (heightOfDocument >= 435) {
            page = pdfDoc.addPage();
            page.setRotation(degrees(90));

            imageHeight = 150;
            imageLabelHeight = 165;
            heightOfDocument = 35;
        } else {
            imageCount = 8;
        }

        for (let order of this.data.orders) {
            if (order.Images?.length) {
                for (let img of order.Images) {
                    try {
                        console.log('--DEBUG-- img: ', img);
                        if (img.img && img.img.indexOf('image/png') !== -1) {
                            console.log('--DEBUG-- 2 png');
                            image = await pdfDoc.embedPng(this.base64ToArrayBuffer(img.img.split(',')[1]));
                        } else {
                            console.log('--DEBUG-- 2 jpg');
                            image = await pdfDoc.embedJpg(this.base64ToArrayBuffer(img.img.split(',')[1]));
                        }

                        if (imageRowCount >= 4) {
                            imageRowCount = 0;
                            imageHeight += 175;
                            imageLabelHeight += 175;
                            imagesDistance = 0;
                        }
                        imageRowCount++;
                        imageCount++;
    
                        dims = image.scale(0.6);
    
                        if (dims.height > 150) {
                            dims.height = 150;
                            dims.width = 130;
                        }
    
                        page.drawImage(image, {
                            x: imageHeight,
                            y: height - 805 + imagesDistance,
                            width: dims.width,
                            height: dims.height,
                            rotate: degrees(90),
                        });
    
                        page.drawText(`Custom ${order.StairNum}`, {
                            x: imageLabelHeight,
                            y: height - 805 + imagesDistance,
                            size: imageLabelSize,
                            font: titleCourierFont,
                            color: rgb(0, 0, 0),
                            rotate: degrees(90)
                        });
    
                        imagesDistance += 200;

                        console.log('--DEBUG-- image count: ', imageCount);
                        if (imageCount >= 12) {
                            page = pdfDoc.addPage();
                            page.setRotation(degrees(90));
                
                            imageHeight = 150;
                            imageLabelHeight = 165;
                            heightOfDocument = 35;
                            imageCount = 0;
                            imageRowCount = 0;
                            imagesDistance = 0;
                        }
                    } catch (err) {
                        console.log('--DEBUG--  img err: ', err);
                        this.dialog.open(ErrorDialogWindow, {
                            data: {
                                errorMessage: err
                            }
                        });
                        
                        continue;
                    }
                }
            }
        }

        this.shippingManifestPdfBytes = await pdfDoc.saveAsBase64();
        pdfUrl = "data:application/pdf;base64," + encodeURI(this.shippingManifestPdfBytes);

        console.log('--DEBUG-- pdfUrl sales order: ', pdfUrl);

        try {
            this.safePdfUrlShippingManifest = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
        } catch(err) {
            console.log('--DEBUG-- sales order sanitize error: ', err);
        }
    }

    tabChanged(e: any) {
        console.log('--DEBUG-- tab changed: ', e.index);
        let nameByIndex: string = `${this.tabChangedObj[e.index].toString()}PdfBytes`;
        console.log('--DEBUG-- nameByIndex: ', nameByIndex);
        this.safePdfSectionName = nameByIndex as 'workorderPdfBytes';
    }

    newWindow() {
        let pdfWindow = window.open("");
        let pdfSectionName = this[this.safePdfSectionName];
        pdfWindow?.document.write(
            "<iframe width='100%' height='100%' src='data:application/pdf;base64, " +
            encodeURI(pdfSectionName) + "'></iframe>"
        );
    }

    back() {
        this.dialogRef.close();
    }
}
