import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import * as ctrl from "./task.controller";
import { errorHandler } from "../../error-handler";

const taskRouter: Router = Router();
// post
taskRouter.post("/", [authMiddleware], errorHandler(ctrl.create));
// get
// /task?completed=true
// /task?completed=false (*byDefault*)
taskRouter.get("/task", [authMiddleware], errorHandler(ctrl.taskFilter));
taskRouter.get("/", [authMiddleware], errorHandler(ctrl.list));
taskRouter.get("/:id", [authMiddleware], errorHandler(ctrl.findOne));

// patch
taskRouter.patch(
  "/:id/complete",
  [authMiddleware],
  errorHandler(ctrl.completed)
);
taskRouter.patch("/:id", [authMiddleware], errorHandler(ctrl.update));
// delete
taskRouter.delete("/:id", [authMiddleware], errorHandler(ctrl.deleted));

export default taskRouter;
