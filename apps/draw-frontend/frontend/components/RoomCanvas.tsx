"use client"

import { WS_URL } from "@/app/config";
import { initDraw } from "@/app/draw";
import { Socket } from "dgram";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./canvas";
import { json } from "stream/consumers";

export function RoomCanvas({roomId}:{
        roomId:string;
    
}){
    const [socket,setsocket] = useState<WebSocket | null >(null);
  const token = localStorage.getItem("Authorization")

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=${token}`)

        ws.onopen =()=>{
            setsocket(ws);
            const data =JSON.stringify({
              type:"join_room",
              roomId
            });
          
          ws.send(data);
          
        }
    },[])




  if(!socket){
    return <div>
        <h2>Connecting to the server.....</h2>
    </div>
  }

 return <div>
    <Canvas roomId={roomId} socket={socket}/>
 </div>
}