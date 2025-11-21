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


    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ODA4M2U3ZS0xYTAzLTQxYjUtYmI3Ny0yMGZiYzgxOTYzMGUiLCJpYXQiOjE3NjM3Mzk5MzV9.bjZGnQenvvKFf_NX7Fyv79PDS02oZ2FbqBDhcPICQUw`)

        ws.onopen =()=>{
            setsocket(ws);
            ws.send(JSON.stringify({
              type:"join_room",
              roomId
            }))
        }
    },[])




  if(!socket){
    return <div>
        <h2>Connecting to the server.....</h2>
    </div>
  }

 return <div>
    <Canvas roomId={roomId}/>
 </div>
}