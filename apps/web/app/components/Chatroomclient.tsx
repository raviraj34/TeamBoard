"use client"

import { useActionState, useEffect, useState } from "react";
import { UseSocket } from "../../hooks/useSocket";

export  function Chatroomclient({
    messages,
    id
}:{
    messages:{message:string}[];
    id: string
}){
    const [chats ,setchats] = useState(messages);
    const{socket ,loading} = UseSocket();
    const [currentmsg ,setcurrentmsg] = useState("");
    useEffect(()=>{

        if(socket && !loading){


            socket.send(JSON.stringify({
                type:"join_room",
                roomId:id
            }));


            socket.onmessage = (event) =>{
                const parsedData = JSON.parse(event.data);
                if(parsedData.type === "chat"){
                    setchats(c=>[...c, {message:parsedData.message}])
                }
            }
        }
    },[socket,loading ,id])

    return <div>
        {chats.map(m=><div>{m.message}</div>)}

        <input type="text" value={currentmsg} onChange={e=>{
            setcurrentmsg(e.target.value);
        }} />

        <button onClick={()=>{
            socket?.send(JSON.stringify({
                type:"chat",
                roomId:id,
                message:currentmsg
            }))

            setcurrentmsg("");
        }}>send message</button>
    </div>
}