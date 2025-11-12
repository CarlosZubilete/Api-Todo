import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export const PORT: string = process.env.PORT!;
export const SALT_ROUND: string = process.env.SALT_ROUND!;
export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const NODE_ENV: string = process.env.NODE_ENV!;
