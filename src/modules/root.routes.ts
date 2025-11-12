import { Router } from "express";
import authRouter from "./auth/auth.routes";
import taskRouter from "./tasks/task.routes";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/protected/task", taskRouter);

export default rootRouter;
