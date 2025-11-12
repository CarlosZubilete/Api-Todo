import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { PORT } from "./secrets.js";
import rootRouter from "./modules/root.routes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app: Express = express();

app.use(express.json());
app.use("/api", rootRouter);

app.use(errorMiddleware);

app.use(function (req: Request, res: Response, next: NextFunction) {
  res.status(404).send("Sorry, the requested resource was not found.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
