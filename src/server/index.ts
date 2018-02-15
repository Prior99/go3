import * as Express from "express";
import * as BodyParser from "body-parser";
import * as HTTP from "http-status-codes";
import { info, error, warn } from "winston";
import { hyrest } from "hyrest/middleware";
import { AuthorizationMode } from "hyrest";
import { TSDI } from "tsdi";
import { Connection } from "typeorm";
import { Server } from "net";
import * as morgan from "morgan";
import * as Raven from "raven";

import {
    Context,
    getAuthTokenId,
    Users,
    Tokens,
    Validation,
    Games,
    Followerships,
    Feed,
    Token,
    User,
    gnuGoInstalled,
    isProductionEnvironment,
} from "../common";

import { cors, catchError } from "./middlewares";
import { Database } from "./database";

async function serve() {
    process.on("unhandledRejection", err => { error(err); exit(); });
    process.on("uncaughtException", err => { error(err); exit(); });
    process.on("exit", exit);
    process.on("SIGINT", exit);
    process.on("SIGHUP", exit);

    const port = process.env.GO3_PORT || 4001;
    const http = Express();
    let server: Server;

    const tsdi: TSDI = new TSDI();

    tsdi.enableComponentScanner();

    // Make sure the database is initialized.
    const database  = tsdi.get(Database);
    await database.connect();

    http.use(catchError);
    http.use(BodyParser.json({ strict: false }));
    http.use(morgan("tiny", { stream: { write: msg => info(msg.trim()) } }));
    http.use(cors);
    http.use(
        hyrest(
            tsdi.get(Users),
            tsdi.get(Tokens),
            tsdi.get(Validation),
            tsdi.get(Games),
            tsdi.get(Followerships),
            tsdi.get(Feed),
        )
        .context(req => new Context(req))
        .defaultAuthorizationMode(AuthorizationMode.AUTH)
        .authorization(async req => {
            const id = getAuthTokenId(req);
            if (!id) { return false; }
            const token = await tsdi.get(Connection).getRepository(Token).findOne({
                where: { id },
            });
            if (!token) { return false; }
            if (token.deleted) { return false; }
            return true;
        }),
    );

    const availableAIs: { ai: string, aiLevel: number}[] = [];
    if (await gnuGoInstalled()) {
        info("GNU Go found.");
        availableAIs.push(...[
            { ai: "gnugo", aiLevel: 1 },
            { ai: "gnugo", aiLevel: 5 },
            { ai: "gnugo", aiLevel: 8 },
            { ai: "gnugo", aiLevel: 10 },
        ]);
    } else {
        warn("GNU Go not installed.");
    }

    await Promise.all(availableAIs.map(async ({ ai, aiLevel }) => {
        const existingUser = await database.conn.getRepository(User).findOne({ where: { ai, aiLevel } });
        if (existingUser) { return; }
        const name = `GNU Go (Level ${aiLevel})`;
        info(`Missing AI "${name}". Adding new AI player.`);
        const email = "info@92k.de";
        await database.conn.getRepository(User).save({ name, ai, aiLevel, email });
    }));

    server = http.listen(port);

    async function exit() {
        info("Exiting...");
        if (server) {
            server.close();
        }
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

if (isProductionEnvironment()) {
    Raven.config("e4a3122381714de5881af18e38e1c607@sentry.io/287975").install();
    info("Sentry reporting active.");
    Raven.context(serve);
} else {
    info("Sentry reporting not activated.");
    serve();
}
