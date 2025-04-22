import {WebSocketServer, WebSocket} from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import {prismaClient} from '@repo/db/client';

const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  rooms: { roomId: string; ws: WebSocket }[]; // Track WebSocket instances per room
}
const users:User[]=[];

function checkUser(token:string):string | null{
  try{
    const decoded=jwt.verify(token,JWT_SECRET);

  if((typeof decoded)=="string"){
    return null;
  }

  if(!decoded || !decoded.userId){
    return null;
  }

  return decoded.userId;
}catch(e){
  return null;
}
return null;

}
  

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || '';
  const userId = checkUser(token);

  if (userId == null) {
    ws.close();
    return;
  }

  // Add the user if not already present
  let user = users.find((u) => u.userId === userId);
  if (!user) {
    user = { userId, rooms: [] };
    users.push(user);
  }

  ws.on('message', async function message(data) {
    const parsedData = JSON.parse(data as unknown as string);

    if (parsedData.type === 'join_room') {
      const roomId = parsedData.roomId;

      
      const roomExists = user.rooms.find((room) => room.roomId === roomId && room.ws === ws);
      if (!roomExists) {
        user.rooms.push({ roomId, ws });
      }
    }

    if (parsedData.type === 'leave_room') {
      const roomId = parsedData.roomId;

     
      user.rooms = user.rooms.filter((room) => !(room.roomId === roomId && room.ws === ws));
    }

    if (parsedData.type === 'chat') {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      await prismaClient.chat.create({
        data: {
          roomId: parseInt(roomId),
          message,
          userId,
        },
      });

      
      users.forEach((u) => {
        u.rooms.forEach((room) => {
          if (room.roomId === roomId) {
            room.ws.send(
              JSON.stringify({
                type: 'chat',
                message,
                roomId,
              })
            );
          }
        });
      });
    }
  });

  ws.on('close', () => {
    
    users.forEach((user) => {
      user.rooms = user.rooms.filter((room) => room.ws !== ws);
    });
  });
});