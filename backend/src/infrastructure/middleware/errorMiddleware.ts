import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message });
  }
  
  res.status(500).json({ erro: "Erro interno do servidor." });
};
