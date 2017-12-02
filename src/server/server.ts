import * as Express from "express";
import * as BodyParser from "body-parser";
import * as HTTP from "http-status-codes";
import { info } from "winston";
import { cors, logging, error } from "./middlewares";
import { hyrest } from "hyrest/middleware";
import { Users, Tokens } from "controllers";
import { TSDI } from "tsdi";
import { Database } from "server/database";

process.on("unhandledRejection", err => console.error(err));

if (typeof process !== "undefined") {
    const port = 3001;
    const http = Express();

    const tsdi: TSDI = new TSDI();
    tsdi.enableComponentScanner();

    http.use(error);
    http.use(BodyParser.json());
    http.use(logging);
    http.use(cors);
    http.use(hyrest(
        tsdi.get(Users),
        tsdi.get(Tokens),
    ));

    tsdi.get(Database); // Make sure the database is initialized.

    http.listen(port);
    info(`Server started on port ${port}.`);
}
