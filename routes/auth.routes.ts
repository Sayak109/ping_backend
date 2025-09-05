import express from "express";
import  {signIn, signUp, logout, getUserInfo, googleLogin} from "../controllers/auth.controller";
import getUser from "../middleware/auth.middleware"
const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/google", googleLogin);
router.post("/logout", getUser,logout);
router.get("/user/me", getUser, getUserInfo);


export default router;
