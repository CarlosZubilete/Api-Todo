import { Router } from "express";
import { login, logout, signup } from "./auth.controller";
import { errorHandler } from "../../error-handler";
import { authMiddleware } from "../../middleware/authMiddleware";
// import { isAdminMiddleware } from "../../middleware/isAdminMiddleware";

const authRouter: Router = Router();

// this verb is only for ADMIN.
// authRouter.get("/list");

authRouter.post("/signup", errorHandler(signup));
authRouter.post("/login", errorHandler(login));
authRouter.post("/logout", [authMiddleware], errorHandler(logout));

// MIDDLEWARE AND ADMIN
// authRouter.get("/", [authMiddleware, isAdminMiddleware], errorHandler(list));
// // UpDate:
// authRouter.put("/", [authMiddleware, isAdminMiddleware]);

export default authRouter;
