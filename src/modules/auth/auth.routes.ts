import { Router } from "express";
import * as ctrl from "./auth.controller";
import { errorHandler } from "../../error-handler";
import { authMiddleware } from "../../middleware/authMiddleware";

const authRouter: Router = Router();

authRouter.post("/signup", errorHandler(ctrl.signup));
authRouter.post("/login", errorHandler(ctrl.login));
authRouter.post("/logout", [authMiddleware], errorHandler(ctrl.logout));

export default authRouter;
