import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import cors from "cors";
import connectionRouter from "./routes/connection.routes.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

const port = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);
//sare user ko rr me map kr ske
export const userSocketMap=new Map()

/* ================= SOCKET.IO ================= */
io.on("connection", (socket) => {
//   console.log("user connected", socket.id);
    socket.on("register",(userId)=>{
        userSocketMap.set(userId,socket.id)
    })

  socket.on("disconnect", (reason) => {
    // console.log("user disconnected", socket.id, "reason:", reason);
  });
});

/* ================= SERVER ================= */
server.listen(port, async () => {
  await connectDb();
  console.log("server started on port", port);
});
