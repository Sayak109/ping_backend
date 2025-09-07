import "./config/env.config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/config/database.config";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import chatRouter from "./routes/chat.routes";
import { Server } from "socket.io";

connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}.`);
});

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
export const userSocketMap: Record<string, string[]> = {};

io.on("connection", (socket) => {
  const user_id = socket.handshake.query.user_id as string;
  console.log("User connected:", user_id);

  if (user_id) {
    if (!userSocketMap[user_id]) {
      userSocketMap[user_id] = [];
    }
    userSocketMap[user_id].push(socket.id);
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    if (user_id) {
      userSocketMap[user_id] = userSocketMap[user_id].filter(
        (id) => id !== socket.id
      );
      if (userSocketMap[user_id].length === 0) {
        delete userSocketMap[user_id];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

app.use(
  cors({
    origin: process.env.WEB_BASE_URL!,
    credentials: true,
  })
);

app.use(`${process.env.API_SLUG}/auth`, authRouter);
app.use(`${process.env.API_SLUG}/user`, userRouter);
app.use(`${process.env.API_SLUG}/chats`, chatRouter);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("test-message", (msg) => {
    console.log("Received:", msg);
    socket.emit("server-message", `Server received: ${msg}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export default server;
