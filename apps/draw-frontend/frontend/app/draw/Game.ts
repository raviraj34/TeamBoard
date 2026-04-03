import { Tool } from "../../components/canvas";
import { getExistingShapes } from "./http";

// Shape data (no id)
type RectShapeData = { type: "rect"; x: number; y: number; width: number; height: number };
type CircleShapeData = { type: "circle"; centerX: number; centerY: number; radius: number };
type PencilShapeData = { type: "pencil"; path: { x: number; y: number }[] };
type TextShapeData = { type: "text"; x: number; y: number; text: string; fontSize: number };

export type ShapeData = RectShapeData | CircleShapeData | PencilShapeData | TextShapeData;

// Final shape stored in canvas state (must have id = Chat.id in live mode)
export type Shape = ShapeData & { id: string };

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
    private textFinalized = false;

    // moving shapes
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

    // simple id generator – only used in demo / fallback
    private generateId() {
        return Math.random().toString(36).slice(2) + Date.now().toString(36);
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

        this.isDragging = false;
        this.selectedShapeIndex = null;
        this.clearCanvas();
        this.drawAllShapes();
    }

    async init() {
        if (this.mode === "demo") {
            this.clearCanvas();
            return;
        }

        /**
         * IMPORTANT:
         * getExistingShapes(roomId) should now return something like:
         * [
         *   { id: 1, shape: { type: "rect", x, y, width, height } },
         *   { id: 2, shape: { type: "text", x, y, text, fontSize } },
         *   ...
         * ]
         * where `id` is Chat.id
         */
        const rawShapes: any[] = await getExistingShapes(this.roomId);

        this.existingShapes = rawShapes
            .map((s: any) => {
                // Case: { id, shape }
                if (s.id != null && s.shape && s.shape.type) {
                    return {
                        id: String(s.id),
                        ...(s.shape as ShapeData),
                    } as Shape;
                }

                // Case: already in { id, type, ... } form
                if (s.id != null && s.type) {
                    return {
                        id: String(s.id),
                        ...(s as ShapeData),
                    } as Shape;
                }

                // Fallback – not ideal for live, but avoids crash
                if (s.type) {
                    return {
                        id: this.generateId(),
                        ...(s as ShapeData),
                    } as Shape;
                }

                return null;
            })
            .filter(Boolean) as Shape[];

        this.clearCanvas();
        this.drawAllShapes();
    }

    initHandlers() {
        if (!this.socket || this.mode === "demo") return;

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            // New shape created (Chat row inserted on server)
            if (message.type === "chat") {
                const parsed = JSON.parse(message.message);
                /**
                 * Server should send:
                 * {
                 *   type: "chat",
                 *   message: JSON.stringify({
                 *     shapeId: <Chat.id>,
                 *     shape: <ShapeData>
                 *   }),
                 *   roomId
                 * }
                 */
                const shapeData: ShapeData | undefined = parsed.shape;
                const shapeIdRaw = parsed.shapeId;

                if (!shapeData || shapeIdRaw == null) {
                    console.warn("Invalid chat shape payload:", parsed);
                    return;
                }

                const id = String(shapeIdRaw);

                const index = this.existingShapes.findIndex((s) => s.id === id);

                if (index === -1) {
                    this.existingShapes.push({ id, ...shapeData });
                } else {
                    this.existingShapes[index] = { id, ...shapeData };
                }

                this.clearCanvas();
                this.drawAllShapes();
            }

            // Shape position updated (Chat row updated on server)
            else if (message.type === "shape-moved") {
                /**
                 * Server should broadcast:
                 * {
                 *   type: "shape-moved",
                 *   message: JSON.stringify({
                 *     shapeId: <Chat.id>,
                 *     shape: <ShapeData>
                 *   }),
                 *   roomId
                 * }
                 */
                const { shapeId, shape: shapeData } = JSON.parse(
                    message.message
                ) as {
                    shapeId: string | number;
                    shape: ShapeData | Shape;
                };

                const id = String(shapeId);
                const index = this.existingShapes.findIndex((s) => s.id === id);

                if (index !== -1) {
                    const updated: Shape = {
                        id,
                        ...(shapeData as ShapeData),
                    };
                    this.existingShapes[index] = updated;
                    this.clearCanvas();
                    this.drawAllShapes();
                } else {
                    // If somehow we didn't have it, we can insert it
                    this.existingShapes.push({
                        id,
                        ...(shapeData as ShapeData),
                    });
                    this.clearCanvas();
                    this.drawAllShapes();
                }
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawAllShapes() {
        for (let i = 0; i < this.existingShapes.length; i++) {
            const shape = this.existingShapes[i];

            if (i === this.selectedShapeIndex) {
                this.ctx.strokeStyle = "purple";
                this.ctx.fillStyle = "purple";
                this.ctx.lineWidth = 3;
            } else {
                this.ctx.strokeStyle = "black";
                this.ctx.fillStyle = "black";
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

        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "white";
        this.ctx.lineWidth = 1;
    }

    isPointInShape(x: number, y: number, shape: Shape): boolean {
        if (shape.type === "rect") {
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
            for (let i = 0; i < shape.path.length - 1; i++) {
                const p1 = shape.path[i];
                const p2 = shape.path[i + 1];
                const distance = this.distanceToLineSegment(
                    x,
                    y,
                    p1.x,
                    p1.y,
                    p2.x,
                    p2.y
                );
                if (distance < 10) return true;
            }
            return false;
        } else if (shape.type === "text") {
            this.ctx.font = `${shape.fontSize}px Arial`;
            const textWidth = this.ctx.measureText(shape.text).width;
            return (
                x >= shape.x &&
                x <= shape.x + textWidth &&
                y >= shape.y - shape.fontSize &&
                y <= shape.y + 5
            );
        }
        return false;
    }

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
            return Math.sqrt(
                (px - x1) * (px - x1) + (py - y1) * (py - y1)
            );
        }

        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));

        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        return Math.sqrt(
            (px - projX) * (px - projX) + (py - projY) * (py - projY)
        );
    }

    findShapeAtPoint(x: number, y: number): number | null {
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            if (this.isPointInShape(x, y, this.existingShapes[i])) {
                return i;
            }
        }
        return null;
    }

    moveShape(shapeIndex: number, dx: number, dy: number) {
        const shape = this.existingShapes[shapeIndex];

        if (shape.type === "rect") {
            shape.x += dx;
            shape.y += dy;
        } else if (shape.type === "circle") {
            shape.centerX += dx;
            shape.centerY += dy;
        } else if (shape.type === "pencil") {
            shape.path = shape.path.map((p) => ({
                x: p.x + dx,
                y: p.y + dy,
            }));
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
        this.textFinalized = false;

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

        const stopAllEvents = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        };

        input.addEventListener("mousedown", stopAllEvents);
        input.addEventListener("mouseup", stopAllEvents);
        input.addEventListener("click", stopAllEvents);

        input.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (!this.textFinalized) {
                    this.textFinalized = true;
                    this.finalizeText(x, y, input.value);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                this.removeTextInput();
                this.textFinalized = false;
            }
        });

        input.addEventListener("blur", () => {
            if (!this.textFinalized && input.value.trim()) {
                this.textFinalized = true;
                this.finalizeText(x, y, input.value);
            } else {
                this.removeTextInput();
            }
        });
    }

    finalizeText(x: number, y: number, text: string) {
    if (!text.trim()) {
        this.removeTextInput();
        this.textFinalized = false;
        return;
    }

    const data: TextShapeData = {
        type: "text",
        x,
        y: y + 20,
        text: text.trim(),
        fontSize: 20,
    };

    // Generate id locally
    const id = this.generateId();
    const shape: Shape = { id, ...data };

    // ✅ ALWAYS add locally so it shows immediately
    this.existingShapes.push(shape);
    this.clearCanvas();
    this.drawAllShapes();

    // ✅ Send to server to sync (other users will get it)
    if (this.mode !== "demo" && this.socket) {
        this.socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shapeId: id, shape: data }),
                roomId: this.roomId,
            })
        );
    }

    // Cleanup
    this.removeTextInput();
    this.textFinalized = false;
}

    removeTextInput() {
        if (!this.textInput) return;

        try {
            if (this.textInput.parentNode) {
                this.textInput.parentNode.removeChild(this.textInput);
            }
        } catch (e) {
            console.warn("Input already removed:", e);
        }

        this.textInput = null;
        this.isEditingText = false;
    }

    mouseDownHandler = (e: MouseEvent) => {
        if (this.selectedTool === "text") {
            this.createTextInput(e.offsetX, e.offsetY);
            return;
        }

        if (this.textInput) {
            this.removeTextInput();
        }

        if (this.selectedTool === "select") {
            const shapeIndex = this.findShapeAtPoint(e.offsetX, e.offsetY);

            if (shapeIndex !== null) {
                this.isDragging = true;
                this.selectedShapeIndex = shapeIndex;
                this.dragOffsetX = e.offsetX;
                this.dragOffsetY = e.offsetY;

                this.canvas.style.cursor = "move";

                this.clearCanvas();
                this.drawAllShapes();
                return;
            } else {
                this.selectedShapeIndex = null;
                this.clearCanvas();
                this.drawAllShapes();
                return;
            }
        }

        this.clicked = true;
        this.startX = e.offsetX;
        this.startY = e.offsetY;

        if (this.selectedTool === "pencil") {
            this.currentPath = [{ x: e.offsetX, y: e.offsetY }];
        }
    };

    mouseMoveHandler = (e: MouseEvent) => {
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

    // ---------------------
    // 1️⃣ MOVE SHAPE
    // ---------------------
    if (this.isDragging && this.selectedShapeIndex !== null) {
        this.isDragging = false;
        this.canvas.style.cursor = this.selectedTool === "select" ? "default" : "crosshair";
        
        const shape = this.existingShapes[this.selectedShapeIndex];
        if (!shape) return;

        const { id, ...shapeData } = shape;

        // Broadcast movement
        if (this.socket && this.mode !== "demo") {
            this.socket.send(
                JSON.stringify({
                    type: "shape-moved",
                    message: JSON.stringify({ shapeId: id, shape: shapeData }),
                    roomId: this.roomId
                })
            );
        }

        return;
    }

    // ---------------------
    // 2️⃣ TEXT or SELECT → do nothing
    // ---------------------
    if (this.selectedTool === "text" || this.selectedTool === "select") return;



    // ---------------------
    // 3️⃣ CREATE NEW SHAPE
    // ---------------------
    this.clicked = false;

    const endX = e.offsetX;
    const endY = e.offsetY;

    const width = endX - this.startX;
    const height = endY - this.startY;

    let data: ShapeData | null = null;

    if (this.selectedTool === "pencil" && this.currentPath.length > 1) {
        data = { type: "pencil", path: this.currentPath };
        this.currentPath = [];
    } else if (this.selectedTool === "rect") {
        data = { type: "rect", x: this.startX, y: this.startY, width, height };
    } else if (this.selectedTool === "circle") {
        const radius = Math.sqrt(width * width + height * height) / 2;
        data = {
            type: "circle",
            centerX: this.startX + width / 2,
            centerY: this.startY + height / 2,
            radius
        };
    }

    if (!data) return;


    // ---------------------
    // 4️⃣ ALWAYS Add Locally First (Fix disappearing bug)
    // ---------------------
    const tempId = this.generateId();
    const shape: Shape = { id: tempId, ...data };

    this.existingShapes.push(shape);

    this.clearCanvas();
    this.drawAllShapes();


    // ---------------------
    // 5️⃣ Broadcast to others — server will also store it in DB
    // ---------------------
    if (this.socket && this.mode !== "demo") {
        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shapeId: tempId, shape: data }),
            roomId: this.roomId
        }));
    }
};


    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}
