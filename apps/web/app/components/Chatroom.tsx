
import axios from "axios";
import { BACKEND_URL } from "../config"
import { Chatroomclient } from "./Chatroomclient";


async function getChats(roomId: string){
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    return response.data.messages
}


export default async function ChatRoom({id}:{
    id:string
}){
    const message = await getChats(id);
     return <Chatroomclient id={id} messages={message} />
}