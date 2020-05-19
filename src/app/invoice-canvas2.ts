export class InvoiceCanvas2 {
    canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private image: HTMLImageElement;
    private trackTransforms: TrackTransforms; 

    private lastX: number;
    private lastY: number;
    private dragStart: any;
    private dragged: boolean;
    private scaleFactor = 1.1;

    constructor(canvas: HTMLCanvasElement, image: HTMLImageElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.image = image;
        this.lastX = canvas.width / 2;
        this.lastY = canvas.height / 2;
        this.trackTransforms = new TrackTransforms(this.context);
        this.redraw();
    }
    
    setEvents(): void {
        this.canvas.onmousedown = (event: MouseEvent) => {
            this.lastX = event.offsetX || (event.pageX - this.canvas.offsetLeft);
            this.lastY = event.offsetY || (event.pageY - this.canvas.offsetTop);
            this.dragStart = this.transformedPoint(this.lastX, this.lastY);
            this.dragged = false;
        };

        this.canvas.addEventListener('mousemove', function (evt) {
            lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
            dragged = true;
            if (dragStart) {
                var pt = ctx.transformedPoint(lastX, lastY);
                ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
                redraw();
            }
        }, false);

        this.canvas.addEventListener('mouseup', function (evt) {
            dragStart = null;
            if (!dragged) zoom(evt.shiftKey ? -1 : 1);
        }, false);
        this.canvas.addEventListener('DOMMouseScroll', this.handleScroll, false);
        this.canvas.addEventListener('mousewheel', this.handleScroll, false);

    }
    zoom (clicks: number) {
        let ctx = this.context;

        var pt = ctx.transformedPoint(lastX, lastY);
        ctx.translate(pt.x, pt.y);
        var factor = Math.pow(scaleFactor, clicks);
        ctx.scale(factor, factor);
        ctx.translate(-pt.x, -pt.y);
        this.redraw();
    }
    handleScroll (evt: WheelEvent) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) this.zoom(delta);
        return evt.preventDefault() && false;
    }
    
    redraw(): void {

        // Clear the entire canvas
        var p1 = ctx.transformedPoint(0, 0);
        var p2 = ctx.transformedPoint(canvas.width, canvas.height);
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        ctx.drawImage(gkhead, 0, 0);
    }
}


// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
export class TrackTransforms{
    private svg: SVGSVGElement;
    private xform: DOMMatrix;
    private ctx: CanvasRenderingContext2D;

    private savedTransforms = [];

    constructor(ctx: CanvasRenderingContext2D) {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        this.xform = this.svg.createSVGMatrix();
        this.ctx = ctx;
        this.ctx.getTransform = function () { return this.xform; };
    }

    

    
    var save = ctx.save;
    ctx.save = function () {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
    };

    var restore = ctx.restore;
    ctx.restore = function () {
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function (sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };

    var rotate = ctx.rotate;
    ctx.rotate = function (radians) {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };

    var translate = ctx.translate;
    ctx.translate = function (dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };

    var transform = ctx.transform;
    ctx.transform = function (a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
    };

    var setTransform = ctx.setTransform;
    ctx.setTransform = function (a: number, b: number, c: number, d: number, e: number, f: number) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };

    var pt = svg.createSVGPoint();
    ctx.transformedPoint = function (x: number, y: number) {
        pt.x = x; pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }

}