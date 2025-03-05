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

import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

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

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<any>,
    ) {
        this.currentOrder = data;
        this.safePdfSectionName = 'workorderPdfBytes';
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
    
        const wholePart = Math.floor(decimal);
        let fractionalPart = decimal - wholePart;
    
        // Define common denominators (powers of 2 for accuracy)
        const commonDenominators = [2, 4, 8, 16, 32, 64, 128];
    
        let bestNumerator = 0, bestDenominator = 1;
        let minDifference = Number.MAX_VALUE;
    
        for (const denom of commonDenominators) {
            const num = Math.round(fractionalPart * denom);
            const approxValue = num / denom;
            const difference = Math.abs(fractionalPart - approxValue);
    
            if (difference < minDifference) {
                bestNumerator = num;
                bestDenominator = denom;
                minDifference = difference;
            }
        }
    
        // If the fraction reduces to 0 (e.g., whole numbers)
        if (bestNumerator === 0) return wholePart.toString();
    
        return `${wholePart} ${bestNumerator}/${bestDenominator}`;
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

            page.drawText(`${this.decimalToMixedFraction(order.StairRun)}`, {
                x: heightOfDocument,
                y: height - 410,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            let adjRise = `${this.decimalToMixedFraction(order.AdjRise)}`;

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
                y: height - 50,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            let comment = order.WorkorderComments || order.OrderType;

            comment = comment.replace(/(\r\n|\n|\r)/gm,'')

            if (comment) {
                if (comment.length > 40 && order.blurb_winder) {
                    const commentsArr = this.splitBy2(comment, ' ');

                    page.drawText(`${commentsArr[0]}`, {
                        x: heightOfDocument + extended + 13,
                        y: height - 805,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0.53, 0),
                        rotate: degrees(90)
                    });

                    page.drawText(`${commentsArr[1]}`, {
                        x: heightOfDocument + extended + 26,
                        y: height - 805,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0.53, 0),
                        rotate: degrees(90)
                    });

                    extended += 10;
                } else {
                    page.drawText(`${comment}`, {
                        x: heightOfDocument + extended + 13,
                        y: height - 805,
                        size: tableFontSize,
                        font: courierFont,
                        color: rgb(0, 0.53, 0),
                        rotate: degrees(90)
                    });
                }
            }

            if (order.blurb_winder) {
                page.drawText(`${order.blurb_winder.replace(/\\n/g, '')}`, {
                    x: heightOfDocument + extended + 13,
                    y: height - 490,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0.53, 0, 0),
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
        let imageCount = 0;

        if (heightOfDocument >= 435) {
            page = pdfDoc.addPage();
            page.setRotation(degrees(90));

            imageHeight = 150;
            imageLabelHeight = 165;
            heightOfDocument = 35;
        }

        for (let order of this.data.orders) {
            if (order.Images?.length) {
                for (let img of order.Images) {
                    try {
                        if (img.img.indexOf('image/png') !== -1) {
                            console.log('--DEBUG-- png');
                            image = await pdfDoc.embedPng(this.base64ToArrayBuffer(img.img.split(',')[1]));
                        } else {
                            console.log('--DEBUG-- jpg');
                            image = await pdfDoc.embedJpg(this.base64ToArrayBuffer(img.img.split(',')[1]));
                        }
                        console.log('--DEBUG-- image count: ', imageCount)
                        if (imageCount >= 4) {
                            imageCount = 0;
                            imageHeight += 175;
                            imageLabelHeight += 175;
                            imagesDistance = 0;
                        }
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
                    } catch (err) {
                        console.log('--DEBUG--  img err: ', err);
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

        let cutOrderInfo = (hghtOfDcmnt: number, strs: any, cutThePage: boolean = false) => {
            page.drawText(`SLABS NEEDED FOR TREADS:`, {
                x: hghtOfDcmnt,
                y: height - 800,
                size: fontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
    
            strs.forEach((stair: any) => {
                page.drawText(`${stair.numWholeSlabsNeeded}`, {
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
    
                treadWidth = this.decimalToMixedFraction(stair.TreadWidth);
    
                page.drawText(treadWidth, {
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
    
                page.drawText(`${stair.extraTreadsNeeded}`, {
                    x: hghtOfDcmnt,
                    y: height - 160,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                hghtOfDcmnt += 15;
            });
    
            page.drawText(`1/2 RISER SLABS needed:`, {
                x: hghtOfDcmnt,
                y: height - 800,
                size: fontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
    
            strs.forEach((stair: any) => {
                page.drawText(`${stair.numWholeSlabsNeededTotal}`, {
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
    
                treadWidth = this.decimalToMixedFraction(stair.RiserWidth);
    
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
    
                page.drawText(`${stair.numExtraRisersNeeded}`, {
                    x: hghtOfDcmnt,
                    y: height - 160,
                    size: fontSize,
                    font: titleCourierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                hghtOfDcmnt += 15;
            });
    
    
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
    
            page.drawText(`# standart risers can be made:`, {
                x: hghtOfDcmnt,
                y: height - 700,
                size: fontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
    
            hghtOfDcmnt += 25;
    
            if (hghtOfDcmnt > 500 && cutThePage) {
                page = pdfDoc.addPage();
                page.setRotation(degrees(90));
    
                hghtOfDcmnt = 35;
            }

            page.drawText(`Threads:`, {
                x: hghtOfDcmnt,
                y: height - 650,
                size: fontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
    
            strs.forEach((stair: any) => {
                page.drawText(`${stair.numRisersNeededTopRiser} ${this.pieceMaker(stair.numRisersNeededTopRiser)}`, {
                    x: hghtOfDcmnt,
                    y: height - 550,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`Run:   ${this.decimalToMixedFraction(stair.TreadRun)}`, {
                    x: hghtOfDcmnt,
                    y: height - 450,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`width:   ${this.decimalToMixedFraction(stair.TreadWidth)}`, {
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
            
            page.drawText(`RISERS Standart:`, {
                x: hghtOfDcmnt,
                y: height - 700,
                size: fontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
    
            strs.forEach((stair: any) => {
                page.drawText(`${stair.NumStdRisers} ${this.pieceMaker(stair.NumStdRisers)}`, {
                    x: hghtOfDcmnt,
                    y: height - 550,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`Rise:   ${this.decimalToMixedFraction(stair.CutRise)}`, {
                    x: hghtOfDcmnt,
                    y: height - 450,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`width:   ${this.decimalToMixedFraction(stair.RiserWidth)}`, {
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
    
            page.drawText(`Bottom:`, {
                x: hghtOfDcmnt,
                y: height - 650,
                size: fontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
    
            strs.forEach((stair: any) => {
                page.drawText(`${1} ${this.pieceMaker(1)}`, {
                    x: hghtOfDcmnt,
                    y: height - 550,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`Rise:   ${this.decimalToMixedFraction(stair.CutBottomRise)}`, {
                    x: hghtOfDcmnt,
                    y: height - 450,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`width:   ${this.decimalToMixedFraction(stair.RiserWidth)}`, {
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

            page.drawText(`TOP RISER:`, {
                x: hghtOfDcmnt,
                y: height - 665,
                size: fontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });
    
            strs.forEach((stair: any) => {
                page.drawText(`${1} ${this.pieceMaker(1)}`, {
                    x: hghtOfDcmnt,
                    y: height - 550,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`Rise:   ${this.decimalToMixedFraction(stair.CutTopRise)}`, {
                    x: hghtOfDcmnt,
                    y: height - 450,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                page.drawText(`width:   ${this.decimalToMixedFraction(stair.CalcWidth)}`, {
                    x: hghtOfDcmnt,
                    y: height - 250,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
    
                page.drawText(`${stair.OrderType && stair.OrderType.slice(1) || ''}`, {
                    x: hghtOfDcmnt,
                    y: height - 100,
                    size: fontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
        
                hghtOfDcmnt += 15;
            });

            return hghtOfDcmnt;
        }

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

        console.log('--DEBUG-- height of document 1: ', heightOfDocument);

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

            /* if (order.blurb_winder) {
                page.drawText(`${order.blurb_winder}`, {
                    x: heightOfDocument,
                    y: height - 450,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0, 0, 0),
                    rotate: degrees(90)
                });
            } */

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

                heightOfDocument += 25;
            }

            if (order.SectionType === 'Stair') {
                heightOfDocument = cutOrderInfo(heightOfDocument, [order]);
            }

            page.drawLine({
                start: { x: heightOfDocument, y: 30 },
                end: { x: heightOfDocument, y: 810 },
                thickness: 1,
                color: rgb(0, 0, 0),
            });

            console.log('--DEBUG-- height of document 2: ', heightOfDocument);

            if (heightOfDocument > 500) {
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

            page.drawText(`${this.decimalToMixedFraction(order.StairRun)}`, {
                x: heightOfDocument,
                y: height - 275,
                size: tableFontSize,
                font: courierFont,
                color: rgb(0, 0, 0),
                rotate: degrees(90)
            });

            if (order.blurb_winder) {
                page.drawText(`${order.blurb_winder.replace(/\\n/g, '')}`, {
                    x: heightOfDocument + extended + 13,
                    y: height - 490,
                    size: tableFontSize,
                    font: courierFont,
                    color: rgb(0.53, 0, 0),
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

        heightOfDocument += 20;

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
        let imageCount = 0;

        console.log('--DEBUG-- heightOfDocument: ', heightOfDocument);
        if (heightOfDocument >= 435) {
            page = pdfDoc.addPage();
            page.setRotation(degrees(90));

            imageHeight = 150;
            imageLabelHeight = 165;
            heightOfDocument = 35;
        }

        for (let order of this.data.orders) {
            if (order.Images?.length) {
                for (let img of order.Images) {
                    try {
                        if (img.indexOf('image/png') !== -1) {
                            console.log('--DEBUG-- png');
                            image = await pdfDoc.embedPng(this.base64ToArrayBuffer(img.img.split(',')[1]));
                        } else {
                            console.log('--DEBUG-- jpg');
                            image = await pdfDoc.embedJpg(this.base64ToArrayBuffer(img.img.split(',')[1]));
                        }
                        console.log('--DEBUG-- image count: ', imageCount)
                        if (imageCount >= 4) {
                            imageCount = 0;
                            imageHeight += 175;
                            imageLabelHeight += 175;
                            imagesDistance = 0;
                        }
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
                    } catch (err) {
                        console.log('--DEBUG--  img err: ', err);
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
