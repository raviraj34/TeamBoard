import { Tool } from "../../components/canvas";
import { getExistingShapes } from "./http";

type Shape =
    | { type: "rect"; x: number; y: number; width: number; height: number }
    | { type: "circle"; centerX: number; centerY: number; radius: number }
    | { type: "pencil"; path: { x: number; y: number }[] }
    | { type: "text"; x: number; y: number; text: string; fontSize: number };

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[] = [];
    private roomId: string;
    private clicked = false;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "select";
    private currentPath: { x: number; y: number }[] = [];
    private isEditingText = false;
    private textInput: HTMLInputElement | null = null;
    
    // New properties for moving shapes
    private isDragging = false;
    private selectedShapeIndex: number | null = null;
    private dragOffsetX = 0;
    private dragOffsetY = 0;

    socket?: WebSocket;
    mode: "demo" | "live";

    constructor(
        canvas: HTMLCanvasElement,
        roomId: string,
        socket?: WebSocket,
        mode: "demo" | "live" = "live"
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.roomId = roomId;
        this.socket = socket;
        this.mode = mode;

        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.removeTextInput();
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
        if (tool !== "text") {
            this.removeTextInput();
        }
        // Reset drag state when changing tools
        this.isDragging = false;
        this.selectedShapeIndex = null;
        // Redraw to remove selection highlight
        this.clearCanvas();
        this.drawAllShapes();
    }

    async init() {
        if (this.mode === "demo") {
            this.clearCanvas();
            return;
        }

        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
        this.drawAllShapes();
    }

    initHandlers() {
        if (!this.socket || this.mode === "demo") return;

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
                this.drawAllShapes();
            } else if (message.type === "shape-moved") {
                const { shapeIndex, shape } = JSON.parse(message.message);
                if (this.existingShapes[shapeIndex]) {
                    this.existingShapes[shapeIndex] = shape;
                    this.clearCanvas();
                    this.drawAllShapes();
                }
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawAllShapes() {
        for (let i = 0; i < this.existingShapes.length; i++) {
            const shape = this.existingShapes[i];
            
            // Highlight selected shape
            if (i === this.selectedShapeIndex) {
                this.ctx.strokeStyle = "yellow";
                this.ctx.fillStyle = "yellow";
                this.ctx.lineWidth = 3;
            } else {
                this.ctx.strokeStyle = "white";
                this.ctx.fillStyle = "white";
                this.ctx.lineWidth = 1;
            }

            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(
                    shape.centerX,
                    shape.centerY,
                    Math.abs(shape.radius),
                    0,
                    Math.PI * 2
                );
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil") {
                this.ctx.beginPath();
                for (let j = 0; j < shape.path.length - 1; j++) {
                    this.ctx.moveTo(shape.path[j].x, shape.path[j].y);
                    this.ctx.lineTo(shape.path[j + 1].x, shape.path[j + 1].y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "text") {
                this.ctx.font = `${shape.fontSize}px Arial`;
                this.ctx.fillText(shape.text, shape.x, shape.y);
            }
        }

        // Reset styles
        this.ctx.strokeStyle = "white";
        this.ctx.fillStyle = "white";
        this.ctx.lineWidth = 1;
    }

    // Check if a point is inside a shape
    isPointInShape(x: number, y: number, shape: Shape): boolean {
        if (shape.type === "rect") {
            // Fix: Handle negative width/height for rectangles drawn right-to-left or bottom-to-top
            const minX = Math.min(shape.x, shape.x + shape.width);
            const maxX = Math.max(shape.x, shape.x + shape.width);
            const minY = Math.min(shape.y, shape.y + shape.height);
            const maxY = Math.max(shape.y, shape.y + shape.height);
            
            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        } else if (shape.type === "circle") {
            const dx = x - shape.centerX;
            const dy = y - shape.centerY;
            return Math.sqrt(dx * dx + dy * dy) <= Math.abs(shape.radius);
        } else if (shape.type === "pencil") {
            // Check if point is near any segment of the path
            for (let i = 0; i < shape.path.length - 1; i++) {
                const p1 = shape.path[i];
                const p2 = shape.path[i + 1];
                const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
                if (distance < 10) return true; // 10px tolerance
            }
            return false;
        } else if (shape.type === "text") {
            // Measure text properly
            this.ctx.font = `${shape.fontSize}px Arial`;
            const textWidth = this.ctx.measureText(shape.text).width;
            return (
                x >= shape.x &&
                x <= shape.x + textWidth &&
                y >= shape.y - shape.fontSize &&
                y <= shape.y + 5 // Small padding below baseline
            );
        }
        return false;
    }

    // Calculate distance from point to line segment
    distanceToLineSegment(
        px: number,
        py: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;

        if (lengthSquared === 0) {
            return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        }

        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));

        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
    }

    // Find which shape is at the given point (returns last/topmost shape)
    findShapeAtPoint(x: number, y: number): number | null {
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            if (this.isPointInShape(x, y, this.existingShapes[i])) {
                return i;
            }
        }
        return null;
    }

    // Move a shape by delta x and y
    moveShape(shapeIndex: number, dx: number, dy: number) {
        const shape = this.existingShapes[shapeIndex];
        
        if (shape.type === "rect") {
            shape.x += dx;
            shape.y += dy;
        } else if (shape.type === "circle") {
            shape.centerX += dx;
            shape.centerY += dy;
        } else if (shape.type === "pencil") {
            shape.path = shape.path.map(p => ({ x: p.x + dx, y: p.y + dy }));
        } else if (shape.type === "text") {
            shape.x += dx;
            shape.y += dy;
        }
    }

    drawPencilPreview() {
        if (this.currentPath.length < 2) return;

        this.ctx.beginPath();
        for (let i = 0; i < this.currentPath.length - 1; i++) {
            this.ctx.moveTo(this.currentPath[i].x, this.currentPath[i].y);
            this.ctx.lineTo(this.currentPath[i + 1].x, this.currentPath[i + 1].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
    }

    createTextInput(x: number, y: number) {
        if (this.isEditingText) return;

        this.isEditingText = true;

        const rect = this.canvas.getBoundingClientRect();

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Type text...";

        input.style.position = "fixed";
        input.style.left = `${rect.left + x}px`;
        input.style.top = `${rect.top + y}px`;
        input.style.font = "20px Arial";
        input.style.border = "2px solid white";
        input.style.background = "rgba(0, 0, 0, 0.8)";
        input.style.color = "white";
        input.style.padding = "5px";
        input.style.outline = "none";
        input.style.zIndex = "10000";
        input.style.minWidth = "200px";
        input.style.borderRadius = "4px";

        this.textInput = input;
        document.body.appendChild(input);

        setTimeout(() => {
            input.focus();
        }, 0);

        const preventDefaults = (e: Event) => {
            e.stopPropagation();
        };
        input.addEventListener("mousedown", preventDefaults);
        input.addEventListener("mouseup", preventDefaults);
        input.addEventListener("click", preventDefaults);

        input.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.finalizeText(x, y, input.value);
            } else if (e.key === "Escape") {
                e.preventDefault();
                this.removeTextInput();
            }
        });

        input.addEventListener("blur", () => {
            setTimeout(() => {
                if (input.value.trim()) {
                    this.finalizeText(x, y, input.value);
                } else {
                    this.removeTextInput();
                }
            }, 100);
        });
    }

    finalizeText(x: number, y: number, text: string) {
        if (!text.trim()) {
            this.removeTextInput();
            return;
        }

        const shape: Shape = {
            type: "text",
            x,
            y: y + 20,
            text: text.trim(),
            fontSize: 20,
        };

        this.existingShapes.push(shape);
        this.clearCanvas();
        this.drawAllShapes();

        if (this.mode !== "demo") {
            this.socket?.send(
                JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape }),
                    roomId: this.roomId,
                })
            );
        }

        this.removeTextInput();
    }

    removeTextInput() {
        if (this.textInput) {
            this.textInput.remove();
            this.textInput = null;
            this.isEditingText = false;
        }
    }

    mouseDownHandler = (e: MouseEvent) => {
        // Text tool
        if (this.selectedTool === "text") {
            this.createTextInput(e.offsetX, e.offsetY);
            return;
        }

        // Check if clicking on existing shape to move it (only in select mode)
        if (this.selectedTool === "select") {
            const shapeIndex = this.findShapeAtPoint(e.offsetX, e.offsetY);
            
            if (shapeIndex !== null) {
                // Start dragging
                this.isDragging = true;
                this.selectedShapeIndex = shapeIndex;
                this.dragOffsetX = e.offsetX;
                this.dragOffsetY = e.offsetY;
                
                // Change cursor
                this.canvas.style.cursor = "move";
                
                this.clearCanvas();
                this.drawAllShapes();
                return;
            } else {
                // Clicked on empty space - deselect
                this.selectedShapeIndex = null;
                this.clearCanvas();
                this.drawAllShapes();
                return;
            }
        }

        // Normal drawing behavior for other tools
        this.clicked = true;
        this.startX = e.offsetX;
        this.startY = e.offsetY;

        if (this.selectedTool === "pencil") {
            this.currentPath = [{ x: e.offsetX, y: e.offsetY }];
        }
    };

    mouseMoveHandler = (e: MouseEvent) => {
        // Handle dragging shapes
        if (this.isDragging && this.selectedShapeIndex !== null) {
            const dx = e.offsetX - this.dragOffsetX;
            const dy = e.offsetY - this.dragOffsetY;
            
            this.moveShape(this.selectedShapeIndex, dx, dy);
            
            this.dragOffsetX = e.offsetX;
            this.dragOffsetY = e.offsetY;
            
            this.clearCanvas();
            this.drawAllShapes();
            return;
        }

        // Normal drawing behavior
        if (!this.clicked) return;

        if (this.selectedTool === "pencil") {
            this.currentPath.push({ x: e.offsetX, y: e.offsetY });

            this.clearCanvas();
            this.drawAllShapes();
            this.drawPencilPreview();
            return;
        }

        const width = e.offsetX - this.startX;
        const height = e.offsetY - this.startY;

        this.clearCanvas();
        this.drawAllShapes();

        if (this.selectedTool === "rect") {
            this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "circle") {
            const radius = Math.sqrt(width * width + height * height) / 2;

            this.ctx.beginPath();
            this.ctx.arc(
                this.startX + width / 2,
                this.startY + height / 2,
                radius,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
        }
    };

    mouseUpHandler = (e: MouseEvent) => {
        // Handle end of dragging
        if (this.isDragging && this.selectedShapeIndex !== null) {
            this.isDragging = false;
            this.canvas.style.cursor = this.selectedTool === "select" ? "default" : "crosshair";
            
            // Send updated shape via websocket
            if (this.mode !== "demo") {
                this.socket?.send(
                    JSON.stringify({
                        type: "shape-moved",
                        message: JSON.stringify({
                            shapeIndex: this.selectedShapeIndex,
                            shape: this.existingShapes[this.selectedShapeIndex]
                        }),
                        roomId: this.roomId,
                    })
                );
            }
            
            // Keep shape selected but stop dragging
            return;
        }

        if (this.selectedTool === "text" || this.selectedTool === "select") {
            return;
        }

        this.clicked = false;

        const endX = e.offsetX;
        const endY = e.offsetY;

        const width = endX - this.startX;
        const height = endY - this.startY;

        let shape: Shape | null = null;

        if (this.selectedTool === "pencil" && this.currentPath.length > 1) {
            shape = { type: "pencil", path: this.currentPath };
            this.currentPath = [];
        } else if (this.selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height,
            };
        } else if (this.selectedTool === "circle") {
            const radius = Math.sqrt(width * width + height * height) / 2;
            shape = {
                type: "circle",
                centerX: this.startX + width / 2,
                centerY: this.startY + height / 2,
                radius,
            };
        }

        if (!shape) return;

        this.existingShapes.push(shape);

        this.clearCanvas();
        this.drawAllShapes();

        if (this.mode !== "demo") {
            this.socket?.send(
                JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape }),
                    roomId: this.roomId,
                })
            );
        }
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}