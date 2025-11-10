import { useEffect, useState } from "react";
import { WS_URL } from "../app/room/[slug]/config";

export function UseSocket(){
    const [loading ,setloading] = useState(true);
    const [socket,setsocket] = useState<WebSocket>();

    useEffect(()=>{
        const ws = new WebSocket(WS_URL);
        ws.onopen=()=>{
            setloading(false);
            setsocket(ws);
        }
    },[])
    return{
        socket,
        loading
    }
}