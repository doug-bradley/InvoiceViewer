export class InvoiceCanvas {
    canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private image: HTMLImageElement;
    currentX: number;
    currentY: number;
    scaleX: number = 1;
    scaleY: number = 1; 

    isDragging: boolean = false;

    constructor(canvas: HTMLCanvasElement, image: HTMLImageElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.image = image;
        this.setEvents();
    }

    setEvents(): void {
        this.canvas.onmousedown = (event: MouseEvent) => { this.handleMouseDown(event); };
        this.canvas.onmousemove = (event: MouseEvent) => { this.handleMouseMove(event) };
        this.canvas.onmouseup = (event: MouseEvent) => { this.handleMouseUp(event) };
        this.canvas.onmouseenter = (event: MouseEvent) => { this.handleMouseEnter(event) };
        this.canvas.onmouseout = (event: MouseEvent) => { this.handleMouseOut(event); };
    }
    initialize() {
        this.currentX = this.canvas.width / 2;
        this.currentY = this.canvas.height / 2;
        let that = this;
        this.image.onload = () => {
            that.go();
        };
    }
    go() {
        this.resetCanvas();
        this.drawImage();
        requestAnimationFrame(this.go.bind(this));
    }
    resetCanvas() {
        this.context.fillStyle = "#fff";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawImage() {
        this.context.drawImage(
            this.image,
            this.currentX - this.image.width / 2,
            this.currentY - this.image.height / 2
        );
    }
    handleMouseDown = e => {
        this.canvas.style.cursor = 'grabbing';
        this.isDragging = true;
    };
    handleMouseMove = e => {
        if (this.isDragging) {
            this.currentX = e.pageX - this.canvas.offsetLeft;
            this.currentY = e.pageY - this.canvas.offsetTop;            
        }
    };
    handleMouseEnter = e => {
        this.canvas.style.cursor = 'grab';
    }
    handleMouseOut = e => {
        this.isDragging = false;
    };
    handleMouseUp = e => {
        this.canvas.style.cursor = 'grab';
        this.isDragging = false;
    };

    zoomOut(): void {
        this.context.scale(.1, .1);
    }
    
}
