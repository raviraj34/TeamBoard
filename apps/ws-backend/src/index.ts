import WebSocket,{ WebSocketServer } from 'ws';
import  Jwt, { decode, JwtPayload } from 'jsonwebtoken';
import {JWT_Secret} from "@repo/backend-common/config"
const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws:WebSocket,
  rooms:string[],
  userId: string
}

const users:User[] = [];

function checkUser(token : string):string | null {
  try{
  const decoded = Jwt.verify(token , JWT_Secret);

  if(typeof decoded =="string"){
    return null;
  }

  if(!decoded || !decoded.userId){
    return null;
  }
  return decoded.userId;
  }catch(e){
    return null;
  }
  return null
}
wss.on('connection', function connection(ws,request) {
  const url = request.url;
  if(!url){
    return;
  }

  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token =queryParams.get('token') || "";
  const userId = checkUser(token);


  if(!userId){
    ws.close()
    
  }

  ws.on('message', function message(data) {
    const parseddata  = JSON.parse(data as unknown as string);


    if(parseddata.type === "join_room"){
      const user = users.find(x=> x.ws === ws);
      user?.rooms.push(parseddata.roomId);
    }

    if(parseddata.type ==="leave_room"){
      const user = users.find(x => x.ws === ws);
      if(!user){
        return;
      }
      user.rooms = user?.rooms.filter(x => x === parseddata.roomId)
    }


    if(parseddata.type === "chat"){
      const roomId = parseddata.roomId;
      const message = parseddata.message

      users.forEach(user =>{
        if(user.rooms.includes(roomId)){
          user.ws.send(JSON.stringify({
               type:"chat",
               message:message,
               roomId

          }))
         
        }
      })
    }
  });

});