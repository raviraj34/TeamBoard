import WebSocket, { WebSocketServer } from 'ws';
import Jwt from 'jsonwebtoken';
import { JWT_Secret } from "@repo/backend-common/config"
import { prismaClient } from '@repo/db/client';

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = Jwt.verify(token, JWT_Secret);

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    ws
  });

  console.log(`User ${userId} connected. Total users: ${users.length}`);

  ws.on('message', async function message(data) {
    try {
      const parsedData = JSON.parse(data as unknown as string);

      // Join room
      if (parsedData.type === "join_room") {
        const user = users.find(x => x.ws === ws);
        if (user && !user.rooms.includes(parsedData.roomId)) {
          user.rooms.push(parsedData.roomId);
          
          // Get room user count
          const roomUsers = users.filter(u => u.rooms.includes(parsedData.roomId));
          
          // Send confirmation to joining user
          ws.send(JSON.stringify({
            type: "joined_room",
            roomId: parsedData.roomId,
            userId: user.userId,
            userCount: roomUsers.length
          }));

          // Notify others in room
          broadcastToRoom(parsedData.roomId, {
            type: "user_joined",
            userId: user.userId
          }, ws);

          console.log(`User ${userId} joined room ${parsedData.roomId}. Room users: ${roomUsers.length}`);
        }
      }

      // Leave room
      if (parsedData.type === "leave_room") {
        const user = users.find(x => x.ws === ws);
        if (!user) return;

        user.rooms = user.rooms.filter(x => x !== parsedData.roomId);

        // Notify others in room
        broadcastToRoom(parsedData.roomId, {
          type: "user_left",
          userId: user.userId
        }, ws);

        console.log(`User ${userId} left room ${parsedData.roomId}`);
      }

      // Chat message
      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId;
        const message = parsedData.message;

        await prismaClient.chat.create({
          data: {
            roomId: Number(roomId),
            message,
            userId
          }
        });

        broadcastToRoom(roomId, {
          type: "chat",
          message: message,
          roomId,
          userId
        }, ws);
      }

      // Canvas: Object added
      if (parsedData.type === "object-added") {
        const { roomId, object } = parsedData.payload;

        broadcastToRoom(roomId, {
          type: "object-added",
          payload: {
            object,
            userId
          }
        }, ws);

        // Auto-save to database (optional, can be done on frontend)
        await saveCanvasToDatabase(roomId);
      }

      // Canvas: Object modified
      if (parsedData.type === "object-modified") {
        const { roomId, object } = parsedData.payload;

        broadcastToRoom(roomId, {
          type: "object-modified",
          payload: {
            object,
            userId
          }
        }, ws);
      }

      // Canvas: Object removed
      if (parsedData.type === "object-removed") {
        const { roomId, objectId } = parsedData.payload;

        broadcastToRoom(roomId, {
          type: "object-removed",
          payload: {
            objectId,
            userId
          }
        }, ws);
      }

      // Canvas: Path created (drawing)
      if (parsedData.type === "path-created") {
        const { roomId, path } = parsedData.payload;

        broadcastToRoom(roomId, {
          type: "path-created",
          payload: {
            path,
            userId
          }
        }, ws);
      }

      // Canvas: Full canvas update
      if (parsedData.type === "canvas-update") {
        const { roomId, canvasData } = parsedData.payload;

        broadcastToRoom(roomId, {
          type: "canvas-update",
          payload: {
            canvasData,
            userId
          }
        }, ws);
      }

      // Canvas: Clear canvas
      if (parsedData.type === "canvas-cleared") {
        const { roomId } = parsedData.payload;

        broadcastToRoom(roomId, {
          type: "canvas-cleared",
          payload: {
            userId
          }
        }, ws);

        // Clear canvas in database
        await prismaClient.room.update({
          where: { id: roomId },
          //@ts-ignore
          data: { canvasData: null }
        });
      }

    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on('close', () => {
    const userIndex = users.findIndex(x => x.ws === ws);
    if (userIndex !== -1) {
      const user = users[userIndex];
      
      // Notify all rooms the user was in
      if(user){
      user.rooms.forEach(roomId => {
        broadcastToRoom(roomId, {
          type: "user_left",
          userId: user.userId
        }, ws);
        
      });
    }
      users.splice(userIndex, 1);
      console.log(`User ${userId} disconnected. Total users: ${users.length}`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Helper function to broadcast to all users in a room (except sender)
function broadcastToRoom(roomId: string, message: any, senderWs?: WebSocket) {
  const messageStr = JSON.stringify(message);
  
  users.forEach(user => {
    if (user.rooms.includes(roomId) && user.ws !== senderWs) {
      if (user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(messageStr);
      }
    }
  });
}

// Helper function to save canvas to database (optional - can be done from frontend)
async function saveCanvasToDatabase(roomId: string) {
  try {
    // Note: This is a placeholder. In practice, you'd get the full canvas data
    // from the frontend via a separate message type or API call
    console.log(`Canvas auto-save triggered for room ${roomId}`);
  } catch (error) {
    console.error('Error saving canvas:', error);
  }
}

console.log('WebSocket server running on ws://localhost:8080');

export { wss };