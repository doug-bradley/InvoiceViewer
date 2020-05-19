import { Component, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import * as pdfjs from 'pdfjs-dist';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvasEl') canvasEl: ElementRef;
  private context: CanvasRenderingContext2D;

  starimg = new Image();
  isDraggable = false;

  currentX = 0;
  currentY = 0;

  InvoiceImgName = "../assets/invoices/sample.jpg";
  InvoicePdfName = "../assets/invoices/sample.pdf";

  constructor() {
    pdfjs.GlobalWorkerOptions.workerSrc = 'assets/pdfjs/pdf.worker.js';
  }

  ngAfterViewInit(): void {
    this.context = (this.canvasEl.nativeElement as HTMLCanvasElement).getContext('2d');

    this.starimg.onload = () => {
      this.Go();
    }
    this.starimg.src = this.InvoiceImgName;
  }
  Go(): void {
    this.MouseEvents();

    setInterval(() => {
      this.ResetCanvas();
      this.DrawImage();

    }, 1000 / 30);
  }
  ResetCanvas(): void {
    this.context.fillStyle = '#fff';
    this.context.fillRect(0, 0, this.canvasEl.nativeElement.width, this.canvasEl.nativeElement.height);
  }
  MouseEvents(): void {
    this.canvasEl.nativeElement.onmousedown = (e) => {
      const { x, y } = this.canvasEl.nativeElement.getBoundingClientRect();
      var mouseX = e.pageX - x;
      var mouseY = e.pageY - y;

      if (mouseX >= (this.currentX - this.starimg.width / 2) &&
        mouseX <= (this.currentX + this.starimg.width / 2) &&
        mouseY >= (this.currentY - this.starimg.height / 2) &&
        mouseY <= (this.currentY + this.starimg.height / 2)) {
        this.isDraggable = true;
        //currentX = mouseX;
        //currentY = mouseY;
      }
    };
    this.canvasEl.nativeElement.onmousemove = (e) => {

      if (this.isDraggable) {
        const { x, y } = this.canvasEl.nativeElement.getBoundingClientRect();
        this.currentX = e.pageX - x;
        this.currentY = e.pageY - y;
      }
    };
    this.canvasEl.nativeElement.onmouseup = (e) => {
      this.isDraggable = false;
    };
    this.canvasEl.nativeElement.onmouseout = (e) => {
      this.isDraggable = false;
    };
  }
  DrawImage(): void {
    let x = Math.max(0, this.currentX - (this.starimg.width));
    let y = Math.max(0, this.currentY - (this.starimg.height));
    // let x = Math.max(0, this.currentX - (this.starimg.width)); 
    // let y = Math.max(0, this.currentY - (this.starimg.height));

    //console.log('x=' + x + '  y=' + y);

    this.context.drawImage(this.starimg, x, y);
  }


}
