import * as Express from "express";
import * as BodyParser from "body-parser";
import * as HTTP from "http-status-codes";
import { info, error } from "winston";
import { hyrest } from "hyrest/middleware";
import { AuthorizationMode } from "hyrest";
import { TSDI } from "tsdi";
import { Connection } from "typeorm";
import { Server } from "net";
import { cors, catchError } from "./middlewares";
import { Users, Tokens, Validation, Games } from "controllers";
import { Context } from "./context";
import { Database } from "./database";
import { Token } from "../models";
import * as morgan from "morgan";

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

    // Make sure the database is initialized.
    const database  = tsdi.get(Database);
    database.connect();

    http.use(catchError);
    http.use(BodyParser.json());
    http.use(morgan("tiny", { stream: { write: msg => info(msg.trim()) } }));
    http.use(cors);
    http.use(
        hyrest(
            tsdi.get(Users),
            tsdi.get(Tokens),
            tsdi.get(Validation),
            tsdi.get(Games),
        )
        .context(tsdi.get(Context))
        .defaultAuthorizationMode(AuthorizationMode.AUTH)
        .authorization(async req => {
            const header = req.get("authorization");
            if (!header) { return false; }
            if (header.substr(0, 7) !== "Bearer ") { return false; }
            const id = header.substring(7, header.length);
            const token = await tsdi.get(Connection).getRepository(Token).findOne({
                where: { id },
            });
            if (!token) { return false; }
            if (token.deleted) { return false; }
            return true;
        }),
    );

    server = http.listen(port);

    async function exit() {
        info("Exiting...");
        server.close();
        try {
            if (database && database.conn && database.conn.isConnected) {
                await database.conn.close();
            }
        } catch (err) {
            error("Could not stop database connection", err);
        }
        tsdi.close();
        info("Goodbye.");
    }
    info(`Server started on port ${port}.`);
}

serve();
