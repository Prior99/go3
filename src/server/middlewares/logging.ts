import { Request, Response, NextFunction } from "express";
import { info } from "winston";

export function logging(req: Request, res: Response, next: NextFunction) {
    next();
    info(`${req.method} ${req.url}: ${res.statusCode}.`);
}
