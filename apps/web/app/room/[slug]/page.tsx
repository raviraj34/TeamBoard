import axios from "axios";
import { BACKEND_URL } from "../../config";
import { devIndicatorServerState } from "next/dist/server/dev/dev-indicator-server-state";
import ChatRoom from "../../components/Chatroom";
export async function getRoomId(slug:string){
    const response =await axios.get(`${BACKEND_URL}/room/${slug}`)
    return response.data.room.id;
}


export default async function ChatRoom1({
    params
}:{
    params:{
        slug:string
    }
}){
    const slug= (await params).slug;
    const roomId = await getRoomId(slug);
//@ts-ignore
    return <ChatRoom id={roomId}></ChatRoom>
}

