import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/config/database.config";
import authRouter from "./routes/auth.routes"

import { Server } from "socket.io";

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}.`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/v1", authRouter);


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