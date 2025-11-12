import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { PORT } from "./secrets";
import rootRouter from "./modules/root.routes";
import { errorMiddleware } from "./middleware/errorMiddleware";
import cookieParser from "cookie-parser";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api", rootRouter);

app.use(errorMiddleware);

app.use(function (req: Request, res: Response, next: NextFunction) {
  res.status(404).send("Sorry, the requested resource was not found.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
