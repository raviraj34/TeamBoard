import { useEffect, useRef, useState } from "react";
import { IconButton } from "../components/IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, Text, MousePointer, Type, ImageIcon, Home } from "lucide-react";
import { Game } from "../app/draw/Game";
import { useRouter } from "next/navigation";

export type Tool = "select" | "circle" | "rect" | "pencil" | "text" | "image";
export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("select");
    const [activeHelp, setActiveHelp] = useState<string | null>(null);

    const helpText: Record<string, string> = {
        select: "Click on shapes to select and drag to move them.",
        pencil: "Click and drag to draw freehand lines.",
        rect: "Click and drag to draw a rectangle.",
        circle: "Click and drag to draw a circle.",
        text: "Click anywhere to type text.",
        image: "Click anywhere → choose image → it will be placed on canvas."
    };

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const g = new Game(canvasRef.current, roomId, socket);
        setGame(g);

        return () => g.destroy();
    }, [roomId, socket]); // ✅ FIXED

    useEffect(() => {
        if (!activeHelp) return;

        const timer = setTimeout(() => {
            setActiveHelp(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [activeHelp]);

    return (
        <div className="h-screen w-screen relative">
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="block"
                style={{
                    cursor:
                        selectedTool === "text"
                            ? "text"
                            : selectedTool === "select"
                                ? "default"
                                : "crosshair"
                }}
            />

            <Topbar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                setActiveHelp={setActiveHelp}   // ✅ PASS THIS
                activeHelp={activeHelp}         // ✅ PASS THIS
                helpText={helpText}             // ✅ PASS THIS
            />
        </div>
    );
}

function Topbar({
    selectedTool,
    setSelectedTool,
    setActiveHelp,
    activeHelp,
    helpText
}: {
    selectedTool: Tool;
    setSelectedTool: (s: Tool) => void;
    setActiveHelp: (s: string) => void;
    activeHelp: string | null;
    helpText: Record<string, string>;
}) {
    const router =useRouter();
    return (

        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">

            <div className="flex gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 relative">

                <IconButton onClick={() => { setSelectedTool("select"); setActiveHelp("select"); }} activated={selectedTool === "select"} icon={<MousePointer />} />

                <IconButton onClick={() => { setSelectedTool("pencil"); setActiveHelp("pencil"); }} activated={selectedTool === "pencil"} icon={<Pencil />} />

                <IconButton onClick={() => { setSelectedTool("rect"); setActiveHelp("rect"); }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} />

                <IconButton onClick={() => { setSelectedTool("circle"); setActiveHelp("circle"); }} activated={selectedTool === "circle"} icon={<Circle />} />

                <IconButton onClick={() => { setSelectedTool("text"); setActiveHelp("text"); }} activated={selectedTool === "text"} icon={<Type />} />

                <IconButton onClick={() => { setSelectedTool("image"); setActiveHelp("image"); }} activated={selectedTool === "image"} icon={<ImageIcon />} />

                {/* ✅ Popup */}
                {activeHelp && (
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50">
                        <div
                            className="
        bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg max-w-xs text-center

        opacity-0 translate-y-2 scale-95
        animate-[popup_0.25s_ease-out_forwards]
      "
                        >
                            {helpText[activeHelp]}
                        </div>
                    </div>
                )}
            </div>
            <div className="fixed top-1 left-220 z-50">
  <button
    onClick={() => router.push("/")}
    className="
      flex items-center gap-2
      bg-white/80 backdrop-blur-md
      border border-gray-200
      px-3 py-2 rounded-xl
      shadow-md
      hover:bg-white
      transition-all duration-200
      hover:scale-105
    "
  >
    <Home size={18} />
    <span className="text-sm font-medium">Home</span>
  </button>
</div>
        </div>
        
    );
}