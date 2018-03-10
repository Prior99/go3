import { destroy, component, factory, initialize } from "tsdi";
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { error, info } from "winston";
import * as Yaml from "yamljs";
import { existsSync } from "fs";

import { User, Token, Game, Board, Participant, Followership } from "../common";

function envConfig() {
    const result: any = {};
    if (!process || !process.env) {
        return result;
    }
    const {
        GO3_DB_DATABASE,
        GO3_DB_USER,
        GO3_DB_PASSWORD,
        GO3_DB_PORT,
        GO3_DB_HOST,
        GO3_DB_LOGGING,
        GO3_DB_DRIVER,
    } = process.env;
    if (GO3_DB_DATABASE) { result.database = GO3_DB_DATABASE; }
    if (GO3_DB_USER) { result.username = GO3_DB_USER; }
    if (GO3_DB_PASSWORD) { result.password = GO3_DB_PASSWORD; }
    if (GO3_DB_PORT) { result.port = GO3_DB_PORT; }
    if (GO3_DB_HOST) { result.host = GO3_DB_HOST; }
    if (GO3_DB_DRIVER) { result.type = GO3_DB_DRIVER; }
    if (GO3_DB_LOGGING) { result.logging = GO3_DB_LOGGING === "true"; }
    return result;
}

@component
export class Database {
    public conn: Connection;

    public async connect() {
        info("Connecting to database...");
        this.conn = await createConnection({
            synchronize: true,
            entities: [
                User,
                Token,
                Game,
                Board,
                Participant,
                Followership,
            ],
            ...(
                existsSync("./database.yml") ? Yaml.load("./database.yml") : {}
            ),
            ...envConfig(),
        });
        info("Connected to database.");
    }

    @destroy
    public async destroy() {
        try {
            if (this.conn && this.conn.isConnected) {
                await this.conn.close();
            }
        } catch (err) {
            error("Could not stop database connection", err);
            return;
        }
        info("Database stopped.");
    }

    @factory
    public getConnection(): Connection {
        return this.conn;
    }
}
