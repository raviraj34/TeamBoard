import { useEffect, useRef, useState } from "react";
import { IconButton } from "../components/IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, Text, MousePointer } from "lucide-react";
import { Game } from "../app/draw/Game";

export type Tool = "select" | "circle" | "rect" | "pencil" | "text";

export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("select"); // Changed default to "select"

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef]);

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            position: "relative"
        }}>
            <canvas 
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}
                style={{
                    display: "block",
                    cursor: selectedTool === "text" ? "text" : selectedTool === "select" ? "default" : "crosshair"
                }}
            />
            <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
        </div>
    );
}

function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return (
        <div style={{
            position: "fixed",
            top: 10,
            left: 10
        }}>
            <div className="flex gap-2">
                <IconButton 
                    onClick={() => setSelectedTool("select")}
                    activated={selectedTool === "select"}
                    icon={<MousePointer />}
                />
                <IconButton 
                    onClick={() => setSelectedTool("pencil")}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                />
                <IconButton 
                    onClick={() => setSelectedTool("rect")}
                    activated={selectedTool === "rect"}
                    icon={<RectangleHorizontalIcon />}
                />
                <IconButton 
                    onClick={() => setSelectedTool("circle")}
                    activated={selectedTool === "circle"}
                    icon={<Circle />}
                />
                <IconButton 
                    onClick={() => setSelectedTool("text")}
                    activated={selectedTool === "text"}
                    icon={<Text />}
                />
            </div>
        </div>
    );
}