// import {Server} from 'socket.io';
// import express from "express";
// import http from "http";

// const app=express();

// const server=http.createServer(app);

// const io= new Server(server,{
//     cors:{
//         origin:process.env.URL,
//         methods:['GET','POST']
//     }
// })

// const userSocketMap={};//this map stores socket id corresponding the user id; userId->socketId

// export const getReceiverSocketId =(receiverId)=> userSocketMap[receiverId];


// io.on('connection',(socket)=>{
//     const userId=socket.handshake.query.userId;
//     if(userId)
//     {
//         userSocketMap[userId]=socket.id;
//         console.log("connected")
//         console.log(`user connected:userId =${userId},SocketId=${socket.id}`);
//     }
//     io.emit('getOnlineUsers',Object.keys(userSocketMap))
    
//     socket.on("sendMessage", ({ receiverId, message }) => {
//     const receiverSocketId = userSocketMap[receiverId];

//     if (receiverSocketId) {
//         io.to(receiverSocketId).emit("receiveMessage", message);
//     }
// });
// socket.on('disconnect',()=>{
//         if(userId)
//         {
//             console.log("disconect");
//             console.log(`user connected:userId =${userId},SocketId=${socket.id}`);
//             delete userSocketMap[userId];
//         }
//         io.emit('getOnlineUsers',Object.keys(userSocketMap));
//     })
// })

// export {app,server,io};
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.URL,
    credentials: true,
  },
});

const userSocketMap = {};

export const getReceiverSocketId = (id) =>
  userSocketMap[id];

io.on("connection", socket => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
