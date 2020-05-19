import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { scheduled } from 'rxjs';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  private context: CanvasRenderingContext2D;
  private image: HTMLImageElement;

  private matrixHistory: DOMMatrix[];

  private dragStartPoint: DOMPoint;
  private dragging: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.image = new Image();
    this.image.src = "../assets/invoices/sample.jpg";

    this.context = this.canvas.nativeElement.getContext('2d');
    this.matrixHistory = new Array<DOMMatrix>();
    this.setEvents();

    this.image.onload = () => {
      this.context.drawImage(this.image, 0, 0);
      this.matrixHistory.push(this.context.getTransform());
    }

  }
  setEvents(): void {
    this.canvas.nativeElement.onmousedown = (event: MouseEvent) => { this.handleMouseDown(event); };
    this.canvas.nativeElement.onmousemove = (event: MouseEvent) => { this.handleMouseMove(event) };
    this.canvas.nativeElement.onmouseup = (event: MouseEvent) => { this.handleMouseUp(event) };
    this.canvas.nativeElement.onmouseenter = (event: MouseEvent) => { this.handleMouseEnter(event) };
    this.canvas.nativeElement.onmouseout = (event: MouseEvent) => { this.handleMouseOut(event); };
  }
  zoomIn = () => {
    this.zoom(1);
  }
  zoomOut = () => {
    this.zoom(-1);
  }
  private scaleFactor: number = 1.1;

  zoom(direction: number): void {
    let matrix = this.matrixHistory[this.matrixHistory.length - 1];

    var factor = Math.pow(this.scaleFactor, direction);
    matrix.a *= factor;
    matrix.d *= factor;

    let center = this.imageCenter();

    this.context.translate(center.x, center.y);
    this.transform(matrix);
    this.clearCanvas();
    this.draw();
    this.context.translate(-center.x, -center.y);



}
  rotateLeft = () => {
    this.rotate(-1);
  }
  rotateRight = () => {
    this.rotate(1);
  }
  imageCenter(): DOMPoint {
    return new DOMPoint(this.image.width / 2, this.image.height / 2);
  }

  rotate(direction: number): void {
    let rotation = direction * 90;
    let centerX = this.image.width / 2;
    let centerY = this.image.height / 2;
    this.context.translate(centerX, centerY);
    this.context.rotate(rotation * Math.PI / 180);
    this.context.translate(-centerX, -centerY);
    this.clearCanvas();
    this.context.drawImage(this.image, this.canvas.nativeElement.width - centerX, this.canvas.nativeElement.height - centerY);
  }

  getCurrentPoint = (event: MouseEvent) => {
    return new DOMPoint(
      event.offsetX || (event.pageX - this.canvas.nativeElement.offsetLeft)
      , event.offsetY || (event.pageY - this.canvas.nativeElement.offsetTop)
    );
  }

  handleMouseDown = (event: MouseEvent) => {
    if(event.ctrlKey) {
      
    }
    this.dragStartPoint = this.getCurrentPoint(event);
    let matrix = this.matrixHistory[this.matrixHistory.length - 1];
    // this adjustment prevents the image from jumping to the top left corner on each drag
    this.dragStartPoint.x -= matrix.e;
    this.dragStartPoint.y -= matrix.f;
    this.dragging = false;
  };

  handleMouseMove = (event: MouseEvent) => {
    this.dragging = true;

    if (this.dragStartPoint) {
      var dragPoint = this.getCurrentPoint(event);
      var matrix = this.matrixHistory[this.matrixHistory.length - 1];
      matrix.e = dragPoint.x - this.dragStartPoint.x;
      matrix.f = dragPoint.y - this.dragStartPoint.y;

      this.transform(matrix);
      this.draw();
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    this.dragStartPoint = null;
  };

  handleMouseEnter = (event: MouseEvent) => {

  };

  handleMouseOut = (event: MouseEvent) => {
    this.dragStartPoint = null;
    this.dragging = false;
  };


  fitContents() {
    this.transform(this.fitToWindow());
    this.clearCanvas();
    this.draw();
  }
  markCenter() {
    var radius = 12;
    this.context.beginPath();
    this.context.arc(this.image.width / 2, this.image.height / 2, radius, 0, 2 * Math.PI, false);
    this.context.fillStyle = 'red';
    this.context.fill();
    this.context.lineWidth = 5;
    this.context.strokeStyle = '#003300';
    this.context.stroke();
  }

  currentImageSize(): DOMPoint {
    let result = new DOMPoint();
    let scale = this.currentScale();
    result.x = this.image.width * scale;
    result.y = this.image.height * scale;
    console.log('current image size: ', result);
    return result;
  }

  currentScale(): number {
    // horizontal and vertical scale should always match.
    let lastMatrix = this.matrixHistory[this.matrixHistory.length - 1];
    return lastMatrix.a;
  }

  fitToWindow(): DOMMatrix {
    let horizontalScale: number;
    let verticalScale: number;

    let horizontalSkewing: number = 0;
    let verticalSkewing: number = 0;

    let x: number;
    let y: number;

    // determine scale
    let currentImageSize = this.currentImageSize();
    let scaleFactorX = this.canvas.nativeElement.width / currentImageSize.x;
    let scaleFactorY = this.canvas.nativeElement.height / currentImageSize.y;
    let scaleFactor = Math.abs(scaleFactorX) < Math.abs(scaleFactorY) ? scaleFactorX : scaleFactorY;
    horizontalScale = scaleFactor;
    verticalScale = scaleFactor;

    // determine offset
    x = (this.canvas.nativeElement.width - (currentImageSize.x * scaleFactor)) / 2;
    y = (this.canvas.nativeElement.height - (currentImageSize.y * scaleFactor)) / 2;

    // load results
    let result = new DOMMatrix();
    result.a = horizontalScale;
    result.b = verticalSkewing;
    result.c = horizontalSkewing;
    result.d = verticalScale;
    result.e = x;
    result.f = y;
    return result;

  }
  transform(matrix: DOMMatrix): void {
    // a:horizontal scaling, b:vertical skewing, c:horizontal skewing, d:vertical scaling, e:horizontal moving, f:vertical moving
    this.matrixHistory.push(matrix);
    this.context.setTransform(matrix);
    // this.context.transform(
    //   matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f
    // );

  }

  draw(): void {
    this.clearCanvas();
    this.context.drawImage(this.image, 0, 0);
  }
  clearCanvas(): void {
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.context.restore();
  }

}
