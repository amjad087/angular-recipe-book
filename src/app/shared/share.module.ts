import { CommonModule } from '@angular/common';

import { PlaceHolderDirective } from './place-holder/place-holder.directive';
import { AlertComponent } from './alert/alert.component';
import { DropdownDirective } from './dropdown.directive';
import { NgModule } from '@angular/core';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    PlaceHolderDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DropdownDirective,
    AlertComponent,
    LoadingSpinnerComponent,
    PlaceHolderDirective,
    CommonModule
  ],
  entryComponents: [AlertComponent]
})
export class Sharedmodule {}
