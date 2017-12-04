import * as Express from "express";
import * as BodyParser from "body-parser";
import * as HTTP from "http-status-codes";
import { info, error } from "winston";
import { hyrest } from "hyrest/middleware";
import { TSDI } from "tsdi";
import { Connection } from "typeorm";
import { Server } from "net";
import { cors, logging, catchError } from "./middlewares";
import { Users, Tokens, Validation, Games } from "controllers";
import { Context } from "./context";
import { Database } from "./database";

async function serve() {
    process.on("unhandledRejection", err => { error(err); exit(); });
    process.on("uncaughtException", err => { error(err); exit(); });
    process.on("exit", exit);
    process.on("SIGINT", exit);
    process.on("SIGHUP", exit);

    const port = 3001;
    const http = Express();
    let server: Server;

    const tsdi: TSDI = new TSDI();

    tsdi.enableComponentScanner();

    http.use(catchError);
    http.use(BodyParser.json());
    http.use(logging);
    http.use(cors);
    http.use(hyrest(
        tsdi.get(Users),
        tsdi.get(Tokens),
        tsdi.get(Validation),
        tsdi.get(Games),
    ).context(tsdi.get(Context)));

    // Make sure the database is initialized.
    const database  = tsdi.get(Database);
    database.connect();

    server = http.listen(port);

    async function exit() {
        info("Exiting...");
        server.close();
        if (database.conn.isConnected) {
            try {
                await database.conn.close();
            } catch (err) {
                error("Could not stop database connection", err);
            }
        }
        tsdi.close();
        info("Goodbye.");
    }
    info(`Server started on port ${port}.`);
}

serve();
