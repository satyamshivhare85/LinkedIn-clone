import express from "express";
import { getCurrentUser, updateProfie } from "../controllers/user.controllers.js";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";

let userRouter = express.Router();

// ===============================
// GET CURRENT USER
// ===============================
userRouter.get("/currentuser", isAuth, getCurrentUser);

// ===============================
// UPDATE PROFILE
// ===============================
userRouter.put(
  "/updateprofile",
  isAuth,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateProfie
);

export default userRouter;
