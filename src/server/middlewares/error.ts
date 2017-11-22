import { Request, Response, NextFunction } from "express";
import { error as reportError } from "winston";

export function error(req: Request, res: Response, next: NextFunction) {
    try {
        next();
    } catch(err) {
        reportError("An error occured:", err);
        res.status(500).send({ error: "Internal error." });
    }
}
