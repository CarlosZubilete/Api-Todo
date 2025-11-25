import express, { Express, type Response } from "express";
import { PORT } from "./secrets";
import rootRouter from "./modules/root.routes";
import { errorMiddleware } from "./middleware/errorMiddleware";
import cookieParser from "cookie-parser";
import cors from "cors";

const app: Express = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

app.get("/", (_, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", rootRouter);

app.use(errorMiddleware);

app.use(function (_, res: Response) {
  res.status(404).send("Sorry, the requested resource was not found.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
