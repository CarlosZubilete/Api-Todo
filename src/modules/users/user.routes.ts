import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdminMiddleware } from "../../middleware/isAdminMiddleware";
import { errorHandler } from "../../error-handler";
import { listUser, findUser, updateUser, softDelete } from "./user.controller";

const userRouter: Router = Router();

userRouter.get(
  "/",
  [authMiddleware, isAdminMiddleware],
  errorHandler(listUser)
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

userRouter.delete(
  "/:id",
  [authMiddleware, isAdminMiddleware],
  errorHandler(softDelete)
);

export default userRouter;

// TODO:
// * Physical delete:
/* 
1. SUPER-ADMIN PERMISSIONS
2. confirmation or additional security token
example: DELETE /users/:id?permanent=true
*/
