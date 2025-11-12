import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";

const taskRouter: Router = Router();

taskRouter.get("/", [authMiddleware], (_: Request, res: Response) => {
  res.json({ message: "YOUR ARE IN PROTECTED..." });
});

export default taskRouter;
