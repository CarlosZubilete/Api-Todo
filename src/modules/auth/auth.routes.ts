import { Router } from "express";
import { list, login, logout, signup } from "./auth.controller";
import { errorHandler } from "../../error-handler";
import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdminMiddleware } from "../../middleware/isAdminMiddleware";

const authRouter: Router = Router();

// this verb is only for ADMIN.
// authRouter.get("/list");

authRouter.post("/signup", errorHandler(signup));
authRouter.post("/login", errorHandler(login));
// MIDDLEWARE
authRouter.post("/logout", [authMiddleware], errorHandler(logout));
// MIDDLEWARE AND ADMIN
authRouter.get("/", [authMiddleware, isAdminMiddleware], errorHandler(list));

export default authRouter;
