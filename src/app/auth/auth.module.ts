import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthComponent } from './auth.component';
import { Sharedmodule } from '../shared/share.module';

@NgModule({
  declarations: [
    AuthComponent
  ],
  imports: [
    FormsModule,
    RouterModule.forChild([{path: '', component: AuthComponent}]),
    Sharedmodule
  ],
  exports: [
    AuthComponent
  ]
})
export class AuthModule {}
