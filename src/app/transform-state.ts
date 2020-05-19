export class TransformStates {
    canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private image: HTMLImageElement;

    // objs
    private svg: SVGSVGElement;
    private svgPoint: SVGPoint;
    private svgMatrix: SVGMatrix; 
    private savedTransforms: DOMMatrix[];
    private save: any;
    private restore: any;
    private scale: any; 
    private rotate: any;
    private translate: any;
    private transform: any;
    private setTransformNative: any;
    private pt: any;
    private scaleFactor: number; 
    private currentScaleFactor: number; 
    
    private LastX: number;
    private LastY: number;
    private DragStart: any;
    private Dragged: boolean;

    constructor(canvas: HTMLCanvasElement, image: HTMLImageElement) {
        
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.image = image;

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        this.svgMatrix = this.svg.createSVGMatrix();
        this.context.getTransform = () => { return this.svgMatrix; };
        this.initialize();
        this.setEvents();
        this.overideFunctions();
        this.image.onload = () => {
            this.draw();
        };
    }
    initialize() {
        this.save = this.context.save;
        this.restore = this.context.restore;
        this.scale = this.context.scale; 
        this.rotate = this.context.rotate;
        this.translate = this.context.translate;
        this.transform = this.context.transform;
        this.setTransformNative = this.context.setTransform;
        this.pt = this.svg.createSVGPoint();

        this.savedTransforms = new Array<DOMMatrix>();
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
        console.log('svgMatrix before: ', this.svgMatrix);
        this.DragStart = this.transformPoint(this.LastX, this.LastY);
        console.log('svgMatrix after: ', this.svgMatrix);
        this.Dragged = false;
    };

    handleMouseMove = (event: MouseEvent) => {
        this.LastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
        this.LastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
        this.Dragged = true;
        if (this.DragStart) {
            var dragPoint = this.transformPoint(this.LastX, this.LastY);
            this.context.translate(dragPoint.x - this.DragStart.x, dragPoint.y - this.DragStart.y);
            this.draw();
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

        var pt = this.transformPoint(this.LastX, this.LastY);
        this.context.translate(pt.x, pt.y);
        var factor = Math.pow(this.scaleFactor, direction);  // 1.1 ^ (1 or -1)
        this.currentScaleFactor *= factor; 

        // a:horizontal scaling, b:vertical skewing, c:horizontal skewing, d:vertical scaling, e:horizontal moving, f:vertical moving

        this.svgMatrix.a *= factor;
        this.svgMatrix.d *= factor;

        this.context.scale(factor, factor);
        this.context.translate(-pt.x, -pt.y);
        this.draw();
    }
    overideFunctions() {
        this.context.save = () => { 
            let temp = this.svgMatrix.translate(0,0);
            this.savedTransforms.push(temp); 
            return this.save.call(this.context); 
        }
        this.context.restore = () => { 
            this.svgMatrix = this.savedTransforms.pop(); 
            return this.restore.call(this.context); 
        }
        this.context.scale = (sx: number, sy: number) => {
            this.svgMatrix = this.svgMatrix.scaleNonUniform(sx, sy);
            return this.scale.call(this.context, sx, sy);
        }
        this.context.rotate = (radians: number) => {
            this.svgMatrix = this.svgMatrix.rotate(radians * 180 / Math.PI);
            return this.rotate.call(this.context, radians);
        }
        this.context.translate = (dx: number, dy: number) => {
            this.svgMatrix = this.svgMatrix.translate(dx, dy);
            console.log('this.svgMatrix +++++++++++++++++++++++++++++++++++++++++++++', this.svgMatrix);

            return this.translate.call(this.context, dx, dy);
        }
        this.context.transform = (a: number, b: number, c: number, d: number, e: number, f: number) => {
            let tempMatrix = this.svg.createSVGMatrix();
            
            tempMatrix.a = a;
            tempMatrix.b = b;
            tempMatrix.c = c;
            tempMatrix.d = d;
            tempMatrix.e = e;
            tempMatrix.f = f;
            this.svgMatrix = this.svgMatrix.multiply(tempMatrix);
            return this.transform.call(this.context, a, b, c, d, e, f);
        }
    }
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
        this.svgMatrix.a = a;
        this.svgMatrix.b = b;
        this.svgMatrix.c = c;
        this.svgMatrix.d = d;
        this.svgMatrix.e = e;
        this.svgMatrix.f = f;
        return this.setTransformNative.call(this.context, a, b, c, d, e, f);
    }
    transformPoint(x: number, y: number) {
        this.pt.x = x;
        this.pt.y = y;
        return this.pt.matrixTransform(this.svgMatrix.inverse());
    }
    fitToContents() {

        let widthOfContents = 1300; // this.canvas.width;
        let heightOfContents = 700; // this.canvas.height;

        let p1 = this.transformPoint(0, 0);
        let p2 = this.transformPoint(this.canvas.width, this.canvas.height);
    
        let centerX = (p2.x - p1.x) / 2;
        let centerY = (p2.y - p1.y) / 2;   

        centerX -= widthOfContents / 2;
        centerY -= heightOfContents / 2;
    
        console.log('canvas dims: ', this.canvas.width, this.canvas.height);

        this.context.translate(centerX, centerY);
    
        let lastX = this.canvas.width / 2;
        let lastY = this.canvas.height / 2;
    
        let scaleFactorX = widthOfContents / this.canvas.width;
        let scaleFactorY = heightOfContents / this.canvas.height;
    
        console.log('factor x; factor y; ', scaleFactorX, scaleFactorY);

        let scaleFactorToUse = Math.abs(scaleFactorX) < Math.abs(scaleFactorY) ? scaleFactorX : scaleFactorY;
    
        console.log('scale factor ', scaleFactorToUse);

        let pt = this.transformPoint(lastX, lastY);
        this.context.translate(pt.x, pt.y);
        this.context.scale(scaleFactorToUse, scaleFactorToUse);
        //this.context.translate(-pt.x, -pt.y);
        this.clearCanvas();
        this.drawCentered();

    }
    drawCentered(): void {
        console.log('redraw() ', this.svgMatrix);
        this.clearCanvas(); 

        let width = this.image.width;
        let height = this.image.height;

        

        if(width > this.canvas.width || height > this.canvas.height) {
            let widthRatio = this.canvas.width / width;
            let heightRatio = this.canvas.height / height;

            width *= Math.min(widthRatio, heightRatio);
            height *= Math.min(widthRatio, heightRatio);
        }
        let startX = this.canvas.width / 2 - width /2;
        let startY = this.canvas.height / 2 - height / 2;

        this.context.drawImage(this.image, startX, startY, width, height);
    }
    draw(): void {
        console.log('redraw() ', this.svgMatrix);
        this.clearCanvas(); 
        this.context.drawImage(this.image, 0, 0);
    }
    clearCanvas(): void {
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
        // Clear the entire canvas
        var p1 = this.transformPoint(0, 0);
        var p2 = this.transformPoint(this.canvas.width, this.canvas.height);
        this.context.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

    }
    markCenter(): void {
        var centerX = this.svgMatrix.e + this.canvas.width / 2 * this.svgMatrix.a;
        var centerY = this.svgMatrix.f + this.canvas.height / 2 * this.svgMatrix.d;
        console.log('centerX, centerY: ', centerX, centerY);

        var pt = this.transformPoint(centerX, centerY);

        this.context.translate(pt.x, pt.y);
        
        var radius = 2;
  
        this.context.beginPath();
        this.context.arc(pt.x, pt.y, radius, 10, 2 * Math.PI, false);
        this.context.fillStyle = 'green';
        this.context.fill();
        this.context.lineWidth = 5;
        this.context.strokeStyle = '#003300';
        this.context.stroke();

        console.log('ptx, pty: ', pt.x, pt.y);

        this.context.translate(-pt.x, -pt.y);

    }
}