import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslationWidth } from '@angular/common';

@Component({
  selector: 'app-canvas-sandbox',
  templateUrl: './canvas-sandbox.component.html',
  styleUrls: ['./canvas-sandbox.component.scss']
})
export class CanvasSandboxComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  private context: CanvasRenderingContext2D;
  private image: HTMLImageElement;
  private currentScaleFactor: number = 1;

  private LastX: number;
  private LastY: number;
  private DragStart: any;
  private Dragged: boolean;

  constructor() { }

  ngOnInit(): void {
    this.image = new Image();
    this.image.src = "../assets/invoices/sample.jpg";

    this.context = this.canvas.nativeElement.getContext('2d');
    this.canvas.nativeElement.onmousedown = (event: MouseEvent) => { this.handleMouseDown(event); };
    this.canvas.nativeElement.onmousemove = (event: MouseEvent) => { this.handleMouseMove(event) };
    this.canvas.nativeElement.onmouseup = (event: MouseEvent) => { this.handleMouseUp(event) };
    this.image.onload = () => {
      this.draw();
    }


  }
  handleMouseDown = (event: MouseEvent) => {
    console.log('mouse down', event);
    this.LastX = event.offsetX || (event.pageX - this.canvas.nativeElement.offsetLeft);
    this.LastY = event.offsetY || (event.pageY - this.canvas.nativeElement.offsetTop);
    this.DragStart = this.context.translate(this.LastX, this.LastY);
    this.Dragged = false;
  };

  handleMouseMove = (event: MouseEvent) => {
    this.LastX = event.offsetX || (event.pageX - this.canvas.nativeElement.offsetLeft);
    this.LastY = event.offsetY || (event.pageY - this.canvas.nativeElement.offsetTop);
    this.Dragged = true;
    console.log('dragstart', this.DragStart);

    if (this.DragStart) {
      this.context.translate(this.LastX - this.DragStart.x, this.LastY - this.DragStart.y);
      this.draw();
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    console.log('mouse up', event)
    this.DragStart = null;
  };

  draw(): void {
    this.context.drawImage(this.image, 0, 0);
  }
  clearCanvas(): void {
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.context.restore();
  }

  fitToContents() {

    console.log('image width, height: ', this.image.width, this.image.height);

    let currentImageWidth = this.currentScaleFactor * this.image.width;
    let currentImageHeight = this.currentScaleFactor * this.image.height;

    let scaleFactorX = this.canvas.nativeElement.width / currentImageWidth;
    let scaleFactorY = this.canvas.nativeElement.height / currentImageHeight;

    let scaleFactor = Math.abs(scaleFactorX) < Math.abs(scaleFactorY) ? scaleFactorX : scaleFactorY;

    if (scaleFactor == 1) {
      return;
    }
    this.currentScaleFactor = scaleFactor;
    this.context.scale(this.currentScaleFactor, this.currentScaleFactor);

    currentImageWidth *= this.currentScaleFactor;
    currentImageHeight *= this.currentScaleFactor;

    let leftOffset = (this.canvas.nativeElement.width - currentImageWidth) / 2;
    let topOffset = (this.canvas.nativeElement.height - currentImageHeight) / 2;
    this.context.translate(leftOffset / this.currentScaleFactor, topOffset / this.currentScaleFactor);

    this.clearCanvas();
    this.draw();

    // this.context.translate(-(leftOffset / this.currentScaleFactor), -(topOffset / this.currentScaleFactor));


  }
  markCenter() {
    let currentImageWidth = this.currentScaleFactor * (this.image.width / 2);
    let currentImageHeight = this.currentScaleFactor * (this.image.height / 2);

    let offsetX = (this.canvas.nativeElement.width - currentImageWidth) / 2;
    let offsetY = (this.canvas.nativeElement.height - currentImageHeight) / 2;

    this.context.translate(offsetX + currentImageWidth, offsetY + currentImageHeight);

    var radius = 12;
    this.context.beginPath();
    this.context.arc(currentImageWidth, currentImageHeight, radius, 0, 2 * Math.PI, false);
    this.context.fillStyle = 'red';
    this.context.fill();
    this.context.lineWidth = 5;
    this.context.strokeStyle = '#003300';
    this.context.stroke();

    this.context.translate(-(offsetX + currentImageWidth), -(offsetY + currentImageHeight));

  }

}
