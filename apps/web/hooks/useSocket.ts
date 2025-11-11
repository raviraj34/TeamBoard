import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function UseSocket(){
    const [loading ,setloading] = useState(true);
    const [socket,setsocket] = useState<WebSocket>();

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkNDEyYmE1Ny1jN2FhLTQ3ZjgtODhmNC0zMDZhMmY5OTQ5ZDAiLCJpYXQiOjE3NjI4NDI1OTZ9.uJZqYDVGcxoGIzNAVPj7OE8GpTVjlZo3piBc0o8aY78`);

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