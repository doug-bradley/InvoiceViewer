import { Component, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { InvoiceCanvas3 } from '../invoice-canvas3';
import { TransformStates } from '../transform-state';


@Component({
  selector: 'app-invoice-viewer',
  templateUrl: './invoice-viewer.component.html',
  styleUrls: ['./invoice-viewer.component.scss']
})
export class InvoiceViewerComponent implements AfterViewInit {
  @ViewChild('canvasEl', { static: true }) canvasEl: ElementRef<HTMLCanvasElement>;
  transformStates: any; 

  constructor() { }

  ngAfterViewInit(): void {
    let image = new Image();
    image.src = "../assets/invoices/sample.jpg";
    this.transformStates = new TransformStates(this.canvasEl.nativeElement as HTMLCanvasElement, image);
  
      this.transformStates.canvas.width = this.transformStates.canvas.offsetWidth;
      this.transformStates.canvas.height = this.transformStates.canvas.offsetHeight;
      console.log('width: height: ', this.transformStates.canvas.offsetWidth, this.transformStates.canvas.offsetHeight)
  }
  rotateLeft(): void {
    this.transformStates.rotateLeft();
  }
  rotateRight(): void {
    this.transformStates.rotateRight();
  }
  fitWindow(): void {
    this.transformStates.fitToContents();
  }
  fullSize(): void {
    this.transformStates.fullSize(); 
  }
  markCenter(): void {
    this.transformStates.markCenter();
  }
}
