"use client"

import { WS_URL } from "@/app/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./canvas";

export function RoomCanvas({ roomId }: {
    roomId: string;
}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("Authorization");

        if (!token) {
            setError("No authorization token found");
            return;
        }

        console.log("Connecting to WebSocket...");
        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
            setSocket(ws);
            
            // Join room
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            
            console.log("Joining room:", roomId);
            ws.send(data);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("WebSocket message received:", message);
                
                // The Game class will handle these messages
                // But we can log them here for debugging
                if (message.type === "shape-moved") {
                    console.log("Shape moved message:", message);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setError("WebSocket connection error");
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
            setSocket(null);
        };

        // Cleanup
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                console.log("Leaving room:", roomId);
                ws.send(JSON.stringify({
                    type: "leave_room",
                    roomId
                }));
                ws.close();
            }
        };
    }, [roomId]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!socket || !isConnected) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Connecting to server...</h2>
                    <p className="text-gray-600 mt-2">Please wait</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} />
        </div>
    );
}