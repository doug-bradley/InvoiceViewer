import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceViewerComponent } from './invoice-viewer/invoice-viewer.component';
import { CanvasSandboxComponent } from './canvas-sandbox/canvas-sandbox.component';
import { CanvasComponent } from './canvas/canvas.component'; 

@NgModule({
  declarations: [
    AppComponent,
    InvoiceViewerComponent,
    CanvasSandboxComponent,
    CanvasComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
