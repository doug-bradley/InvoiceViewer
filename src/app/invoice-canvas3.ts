export class InvoiceCanvas3 {
    canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private image: HTMLImageElement;

    // objs
    private svg: SVGSVGElement;
    private svgPoint: SVGPoint;
    private svgMatrix: SVGMatrix; 

    // other
    private scaleFactor: number = 1.1;
    private currentScaleFactor: number = 1; 
    private degrees: number = 0;

    // State Variables
    private LastX: number;
    private LastY: number;
    private DragStart: DOMPoint;
    private Dragged: boolean;

    constructor(canvas: HTMLCanvasElement, image: HTMLImageElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.image = image;

        // SVG
        this.svg = <SVGSVGElement>document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgPoint = this.svg.createSVGPoint(); 
        this.svgMatrix = this.svg.createSVGMatrix();
        this.setEvents();
    }

    setEvents(): void {
        this.canvas.onmousedown = (event: MouseEvent) => { this.handleMouseDown(event); };
        this.canvas.onmousemove = (event: MouseEvent) => { this.handleMouseMove(event) };
        this.canvas.onmouseup = (event: MouseEvent) => { this.handleMouseUp(event) };
        this.canvas.onmouseenter = (event: MouseEvent) => { this.handleMouseEnter(event) };
        this.canvas.onmouseout = (event: MouseEvent) => { this.handleMouseOut(event); };
        this.canvas.onwheel = (event: WheelEvent) => { this.handleMouseScroll(event); };
    }

    handleMouseDown = (event: MouseEvent) => { 
        console.log('mouse down', event);
        this.LastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
        this.LastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
        this.DragStart = this.transformedPoint(this.LastX, this.LastY);
        this.Dragged = false;
    };

    handleMouseMove = (event: MouseEvent) => {
        this.LastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
        this.LastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
        this.Dragged = true;
        if (this.DragStart) {
            var dragPoint = this.transformedPoint(this.LastX, this.LastY);
            this.translate(dragPoint.x - this.DragStart.x, dragPoint.y - this.DragStart.y);
            this.redraw();
        }
    };

    handleMouseUp = (event: MouseEvent) => { 
        console.log('mouse up', event) 
        this.DragStart = null;
        if (!this.Dragged) {
            this.zoom(event.shiftKey ? -1 : 1);
        }
    };
    
    handleMouseEnter = (event: MouseEvent) => { 
        console.log('mouse enter', event) 
    };

    handleMouseOut = (event: MouseEvent) => {
        this.DragStart = null;
        this.Dragged = false;
        console.log('mouse out', event) 
    };
    
    handleMouseScroll = (event: WheelEvent) => { 
        console.log('mouse scroll', event);
        var delta = event.deltaY ? event.deltaY / 40 : event.detail ? -event.detail : 0;
        if (delta) {
            this.zoom(delta);
        }
        event.preventDefault();
    };

    zoom(direction: number): void {
        console.log('zoom', direction);

        var pt = this.transformedPoint(this.LastX, this.LastY);
        this.translate(pt.x, pt.y);
        var factor = Math.pow(this.scaleFactor, direction);  // 1.1 ^ (1 or -1)
        this.currentScaleFactor *= factor; 

        // a:horizontal scaling, b:vertical skewing, c:horizontal skewing, d:vertical scaling, e:horizontal moving, f:vertical moving

        this.svgMatrix.a *= factor;
        this.svgMatrix.d *= factor;

        this.context.scale(factor, factor);
        this.translate(-pt.x, -pt.y);
        this.redraw();
    }

    rotateLeft(): void {
        this.rotate(-1);
    }

    rotateRight(): void {
        this.rotate(1);
    }

    rotate(direction: number): void {
        this.clearCanvas();
        var centerX = this.svgMatrix.e + this.canvas.width / 2 * this.svgMatrix.a;
        var centerY = this.svgMatrix.f + this.canvas.height / 2 * this.svgMatrix.d;

        let halfWidth = this.svgMatrix.e - this.canvas.width / 2;
        let halfHeight = this.svgMatrix.f - this.canvas.height / 2;

        var pt = this.transformedPoint(centerX, centerY);
        this.translate(pt.x, pt.y);

        this.degrees = (direction * 90);

        this.context.rotate(this.degrees * Math.PI / 180);

        this.context.drawImage(this.image, this.svgMatrix.e - halfWidth, this.svgMatrix.f - halfHeight);
        this.translate(-pt.x, -pt.y);
    }

    transformedPoint(x: number, y: number): DOMPoint {
        this.svgPoint.x = x;
        this.svgPoint.y = y; 
        return this.svgPoint.matrixTransform(this.svgMatrix.inverse());
    }
    translate(x: number, y: number): void {
        this.svgMatrix = this.svgMatrix.translate(x, y);
        this.context.translate(x, y);
    }
    clearCanvas(): void {
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
        // Clear the entire canvas
        var p1 = this.transformedPoint(0, 0);
        var p2 = this.transformedPoint(this.canvas.width, this.canvas.height);
        this.context.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

    }
    redraw(): void {
        console.log('redraw() ', this.svgMatrix);
        this.clearCanvas();
        this.context.drawImage(this.image, 0, 0);
    }


    fitImage(): void {
        this.fullSize();
        this.clearCanvas(); 

        let widthRatio = this.image.width / this.canvas.width;
        let heightRatio = this.image.height / this.canvas.height;

        var pt = this.transformedPoint(0, 0);
        console.log('pts ', pt.x, pt.y);

        this.translate(pt.x, pt.y);        
        var factor = Math.pow(widthRatio, -1) * .95;
        this.context.scale(factor, factor);
        this.translate(-pt.x, -pt.y);
        this.redraw();
    }

    fullSize(): void {
        this.clearCanvas(); 
        
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);


        this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height);
        // this.context.restore();
    }

    markCenter(): void {
        var centerX = this.svgMatrix.e + this.canvas.width / 2 * this.svgMatrix.a;
        var centerY = this.svgMatrix.f + this.canvas.height / 2 * this.svgMatrix.d;

        var pt = this.transformedPoint(centerX, centerY);

        this.translate(pt.x, pt.y);
        
        var radius = 2;
  
        this.context.beginPath();
        // this.context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        
        this.context.arc(pt.x, pt.y, radius, 0, 2 * Math.PI, false);

        this.context.fillStyle = 'green';
        this.context.fill();
        this.context.lineWidth = 5;
        this.context.strokeStyle = '#003300';
        this.context.stroke();

        console.log('ptx, pty: ', pt.x, pt.y);

        this.translate(-pt.x, -pt.y);

    }


    old_fitImage(): void {
        this.clearCanvas();

        var wrh = this.image.width / this.image.height;
        var newWidth = this.canvas.width;
        var newHeight = newWidth / wrh;
        if (newHeight > this.canvas.height) {
            newHeight = this.canvas.height;
            newWidth = newHeight * wrh;
        }
        this.context.drawImage(this.image,0,0, newWidth , newHeight);
        this.context.save();
    }
}