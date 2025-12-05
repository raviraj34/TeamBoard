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
    private selectedTool: Tool = "circle";
    private currentPath: { x: number; y: number }[] = [];
    private isEditingText = false;
    private textInput: HTMLInputElement | null = null;

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
        // Remove text input if switching away from text tool
        if (tool !== "text") {
            this.removeTextInput();
        }
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
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawAllShapes() {
        this.ctx.strokeStyle = "white";
        this.ctx.fillStyle = "white";

        for (const shape of this.existingShapes) {
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
                for (let i = 0; i < shape.path.length - 1; i++) {
                    this.ctx.moveTo(shape.path[i].x, shape.path[i].y);
                    this.ctx.lineTo(shape.path[i + 1].x, shape.path[i + 1].y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "text") {
                this.ctx.font = `${shape.fontSize}px Arial`;
                this.ctx.fillText(shape.text, shape.x, shape.y);
            }
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

        // Create input element
        const input = document.createElement("input");
        input.type = "text";
        input.style.position = "absolute";
        input.style.left = `${this.canvas.offsetLeft + x}px`;
        input.style.top = `${this.canvas.offsetTop + y}px`;
        input.style.font = "20px Arial";
        input.style.border = "2px solid white";
        input.style.background = "rgba(0, 0, 0, 0.8)";
        input.style.color = "white";
        input.style.padding = "5px";
        input.style.outline = "none";
        input.style.zIndex = "1000";

        this.textInput = input;
        document.body.appendChild(input);
        input.focus();

        // Handle Enter key to confirm text
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.finalizeText(x, y, input.value);
            } else if (e.key === "Escape") {
                this.removeTextInput();
            }
        });

        // Handle click outside to confirm
        input.addEventListener("blur", () => {
            if (input.value.trim()) {
                this.finalizeText(x, y, input.value);
            } else {
                this.removeTextInput();
            }
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
            y: y + 20, // Adjust for font baseline
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
        // Handle text tool separately
        if (this.selectedTool === "text") {
            this.createTextInput(e.offsetX, e.offsetY);
            return;
        }

        this.clicked = true;
        this.startX = e.offsetX;
        this.startY = e.offsetY;

        if (this.selectedTool === "pencil") {
            this.currentPath = [{ x: e.offsetX, y: e.offsetY }];
        }
    };

    mouseMoveHandler = (e: MouseEvent) => {
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
            const width = e.offsetX - this.startX;
            const height = e.offsetY - this.startY;
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
        // Don't process mouse up for text tool
        if (this.selectedTool === "text") {
            return;
        }

        this.clicked = false;

        const endX = e.offsetX;
        const endY = e.offsetY;

        const width = endX - this.startX;
        const height = endY - this.startY;

        let shape: Shape | null = null;

        // Pencil finish
        if (this.selectedTool === "pencil" && this.currentPath.length > 1) {
            shape = { type: "pencil", path: this.currentPath };
            this.currentPath = [];
        }

        // Rectangle finish
        else if (this.selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height,
            };
        }

        // Circle finish
        else if (this.selectedTool === "circle") {
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