import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { isAdminMiddleware } from "../../middleware/isAdminMiddleware";
import { errorHandler } from "../../error-handler";
import * as ctrl from "./user.controller";

const userRouter: Router = Router();

userRouter.get(
  "/",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.list)
);

userRouter.get(
  "/:id",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.findOne)
);
// GET /user?deleted=true
// GET /user?deleted=false (*byDefault*)
userRouter.get(
  "/user",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.listFiler)
);

userRouter.patch(
  "/:id",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.update)
);

userRouter.delete(
  "/:id",
  [authMiddleware, isAdminMiddleware],
  errorHandler(ctrl.softDelete)
);

export default userRouter;

// TODO:
// * Physical delete:
/* 
1. SUPER-ADMIN PERMISSIONS
2. confirmation or additional security token
example: DELETE /users/:id?permanent=true
*/
