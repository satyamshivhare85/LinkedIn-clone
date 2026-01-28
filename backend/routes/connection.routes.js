import express from "express";
import {
  sendConnection,
  acceptConnection,
  rejectConnection,
  removeConnection,
  getConnectionStatus,
  getConnectionRequests,
  getUserConnections,
} from "../controllers/connection.controllers.js";
import isAuth from "../middleware/isAuth.js";

const connectionRouter = express.Router();

connectionRouter.post("/send/:userId", isAuth, sendConnection);
connectionRouter.put("/accept/:connectionId", isAuth, acceptConnection);
connectionRouter.put("/reject/:connectionId", isAuth, rejectConnection);
connectionRouter.delete("/remove/:userId", isAuth, removeConnection);

connectionRouter.get("/status/:userId", isAuth, getConnectionStatus);
connectionRouter.get("/requests", isAuth, getConnectionRequests);
connectionRouter.get("/", isAuth, getUserConnections);

export default connectionRouter;
