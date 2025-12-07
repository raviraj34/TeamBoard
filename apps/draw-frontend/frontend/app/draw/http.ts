import axios from "axios";
import { HTTP_URL } from "../config";

export async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_URL}/chats/${roomId}`);
    const messages = res.data.messages;

    if (!Array.isArray(messages)) {
        console.warn("⚠ No messages found");
        return [];
    }

    return messages
        .map((msg: any) => {
            if (!msg.shape) return null;

            return {
                id: String(msg.id),  // use DB row id as shape ID
                ...msg.shape         // flatten shape data into final structure
            };
        })
        .filter(Boolean);
}
