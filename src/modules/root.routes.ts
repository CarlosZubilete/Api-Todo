import { Router } from "express";
import authRouter from "./auth/auth.routes.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouter);

export default rootRouter;
