import { Router } from "express";
import { login, logout, signup } from "./auth.controller";
import { errorHandler } from "../../error-handler";
import { authMiddleware } from "../../middleware/authMiddleware";

const authRouter: Router = Router();

// this verb is only for ADMIN.
// authRouter.get("/list");

authRouter.post("/signup", errorHandler(signup));
authRouter.post("/login", errorHandler(login));
authRouter.post("/logout", [authMiddleware], errorHandler(logout));

export default authRouter;
