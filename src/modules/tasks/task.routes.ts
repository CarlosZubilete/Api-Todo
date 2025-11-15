import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as ctrl from "./task.controller";
import { errorHandler } from "../../error-handler";

const taskRouter: Router = Router();

taskRouter.post("/", [authMiddleware], errorHandler(ctrl.create));
taskRouter.get("/", [authMiddleware], errorHandler(ctrl.list));
taskRouter.get("/:id", [authMiddleware], errorHandler(ctrl.findOne));
taskRouter.patch("/:id", [authMiddleware], errorHandler(ctrl.update));
taskRouter.delete("/:id", [authMiddleware], errorHandler(ctrl.deleted));

export default taskRouter;
