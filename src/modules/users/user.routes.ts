import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdminMiddleware } from "../../middleware/isAdminMiddleware";
import { errorHandler } from "../../error-handler";
import { userList, findUser, updateUser } from "./user.controller";

const userRouter: Router = Router();

userRouter.get(
  "/",
  [authMiddleware, isAdminMiddleware],
  errorHandler(userList)
);

userRouter.get(
  "/:id",
  [authMiddleware, isAdminMiddleware],
  errorHandler(findUser)
);

userRouter.patch(
  "/:id",
  [authMiddleware, isAdminMiddleware],
  errorHandler(updateUser)
);

export default userRouter;
