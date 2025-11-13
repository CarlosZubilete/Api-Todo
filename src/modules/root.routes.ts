import { Router } from "express";
import authRouter from "./auth/auth.routes";
import taskRouter from "./tasks/task.routes";
import userRouter from "./users/user.routes";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/protected/user", userRouter);
rootRouter.use("/protected/task", taskRouter);

export default rootRouter;
