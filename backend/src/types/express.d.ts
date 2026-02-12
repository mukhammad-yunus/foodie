import { User } from "./domain";

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, "id" | "email" | "role">;
    }
  }
}

export {};