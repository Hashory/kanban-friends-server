import type { Request, Response, NextFunction } from "express";

export function checkReferer (
  refererUrl: string,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    if (req.get("Referrer") === refererUrl) {
      next();
    }
  };
}
