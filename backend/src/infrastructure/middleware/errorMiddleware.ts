import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  const statusCode = err.status || 400;
  
  res.status(statusCode).json({ erro: err.message || "Erro interno do servidor." });
};
