import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Inject, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DeviceDetectorService } from 'ngx-device-detector';

import { ImagesService } from '../../../services/images.service';

import { ErrorDialogWindow } from '../../error/error-dialog.component';

@Component({
  selector: 'select-stair-shape-detail',
  template: `
    <h2 mat-dialog-title>Select stair shape</h2>
    <mat-dialog-content class="mat-typography text-area">
      <br>
      <mat-form-field appearance="fill">
        <div class="left-top">
          <mat-select [formControl]="leftTopSelected">
            @for (img of topLeftimages; track img) {
              <mat-option [value]="img.ImageText">
                <img width="150" src="{{ img.Image }}" />
                {{ img.ImageText }}
              </mat-option>
            }
          </mat-select>
        </div>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <div class="right-top">
          <mat-select [formControl]="rightTopSelected">
            @for (img of topRightImages; track img) {
              <mat-option [value]="img.ImageText">
                <img width="150" src="{{ img.Image }}" />
                {{ img.ImageText }}
              </mat-option>
            }
          </mat-select>
        </div>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <div class="left-bottom">
          <mat-select [formControl]="leftBottomSelected">
            @for (img of bottomLeftImages; track img) {
              <mat-option  [value]="img.ImageText">
                <img width="150" src="{{ img.Image }}" />
                {{ img.ImageText }}
              </mat-option>
            }
          </mat-select>
        </div>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <div class="right-bottom">
          <mat-select [formControl]="rightBottomSelected">
            @for (img of bottomRightImages; track img) {
              <mat-option [value]="img.ImageText">
                <img width="150" src="{{ img.Image }}" />
                {{ img.ImageText }}
              </mat-option>
            }
          </mat-select>
        </div>
      </mat-form-field>
    </mat-dialog-content>
    <div class='flair-left' *ngIf="!deviceDetectorService.isMobile()">Left</div>
    <div class='flair-right' *ngIf="!deviceDetectorService.isMobile()">Right</div>
    <div class='bullnose-left' *ngIf="!deviceDetectorService.isMobile()">Flair</div>
    <div class='bullnose-right' *ngIf="!deviceDetectorService.isMobile()">Bullnose</div>
    <div class='flair-left-mob' *ngIf="deviceDetectorService.isMobile()">Left Flair</div>
    <div class='flair-right-mob' *ngIf="deviceDetectorService.isMobile()">Right Flair</div>
    <div class='bullnose-left-mob' *ngIf="deviceDetectorService.isMobile()">Left Bullnose</div>
    <div class='bullnose-right-mob' *ngIf="deviceDetectorService.isMobile()">Right Bullnose</div>
    <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">Cancel</button>
        <button mat-button (click)="save()">Confirm</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./select-stair-shape-detail.component.scss'],
  imports: [ 
    MatButtonModule, 
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectStairShapeDetail {
    public readonly deviceDetectorService = inject(DeviceDetectorService);
    public leftTopSelected = new FormControl();
    public rightTopSelected = new FormControl();
    public leftBottomSelected = new FormControl();
    public rightBottomSelected = new FormControl();

    imagesService = inject(ImagesService);
    dialog = inject(MatDialog);

    images:any[] = [];
    topLeftimages: any[] = [];
    topRightImages: any[] = [];
    bottomLeftImages: any[] = [];
    bottomRightImages: any[] = [];
  
    constructor(
      public dialogRef: MatDialogRef<any>,
      @Inject(MAT_DIALOG_DATA) public data: {
        CustomFlairsType: number;
        CustomBullnoseType: number;
        CustomBullnoseTypeRight: number;
        CustomFlairsTypeRight: number;
        blurb_left_bullnose: string;
        blurb_right_bullnose: string;
        blurb_left_flair: string;
        blurb_right_flair: string;
    }) {
      console.log('--DEBUG-- Select Stair Shape Detail: ', data);
      this.topLeftimages = this.imagesService.getSavedDefaultImages('top_left_images');
      this.topRightImages = this.imagesService.getSavedDefaultImages('top_right_images');
      this.bottomLeftImages = this.imagesService.getSavedDefaultImages('bottom_left_images');
      this.bottomRightImages = this.imagesService.getSavedDefaultImages('bottom_right_images');
    
      this.leftTopSelected.setValue(`${this.data.blurb_left_flair}_L`);
      this.rightTopSelected.setValue(`${this.data.blurb_right_flair}_R`);
      this.leftBottomSelected.setValue(`${this.data.blurb_left_bullnose}_L`);
      this.rightBottomSelected.setValue(`${this.data.blurb_right_bullnose}_R`);
    }

    save() {
      const topLeftimage = {
        id: this.leftTopSelected.value,
        img: this.topLeftimages.find(img => img.ImageText === `${this.leftTopSelected.value}`)?.Image
      };
      const topRightImage = {
        id: this.rightTopSelected.value,
        img: this.topRightImages.find(img => img.ImageText === `${this.rightTopSelected.value}`)?.Image
      };
      const bottomLeftImage = {
        id: this.leftBottomSelected.value,
        img: this.bottomLeftImages.find(img => img.ImageText === `${this.leftBottomSelected.value}`)?.Image
      };
      const bottomRightImage = {
        id: this.rightBottomSelected.value,
        img: this.bottomRightImages.find(img => img.ImageText === `${this.rightBottomSelected.value}`)?.Image
      };

      console.log('--DEBUG-- close: ', {
        blurb_left_flair: topLeftimage,
        blurb_right_flair: topRightImage,
        blurb_left_bullnose: bottomLeftImage,
        blurb_right_bullnose: bottomRightImage,
      });

      if (!topLeftimage.img ||
        !topRightImage.img ||
        !bottomLeftImage.img ||
        !bottomRightImage.img
      ) {
        this.dialog.open(ErrorDialogWindow, {
          data: {
              errorMessage: 'All (4) images should be selected!'
          }
        });
      } else {
        this.dialogRef.close({
          blurb_left_flair: topLeftimage,
          blurb_right_flair: topRightImage,
          blurb_left_bullnose: bottomLeftImage,
          blurb_right_bullnose: bottomRightImage,
        });
      }
    }
}