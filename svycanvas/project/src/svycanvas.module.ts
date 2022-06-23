import { Canvas } from './Canvas/Canvas';
import { NgModule } from '@angular/core';
import { ServoyPublicModule } from '@servoy/public';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
@NgModule({
    declarations: [
		Canvas,
    ],
    providers: [],
    imports: [
      ServoyPublicModule,
      CommonModule,
      FormsModule
    ],
    exports: [
		Canvas, 
      ]
})
export class svycanvasModule {}