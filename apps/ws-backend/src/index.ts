import { WebSocketServer } from 'ws';
import  Jwt, { JwtPayload } from 'jsonwebtoken';
import {JWT_Secret} from "@repo/backend-common/config"
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws,request) {
  const url = request.url;
  if(!url){
    return;
  }

  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token =queryParams.get('token');
  const decoded = Jwt.verify(token,JWT_Secret);


  if(!decoded || !(decoded as JwtPayload).userId){
    ws.close();
    return;
  }
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});