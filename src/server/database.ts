import { component, factory, initialize } from "tsdi";
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { info } from "winston";
import * as Yaml from "yamljs";

import { User, Token, Game, Board, Participant, Followership } from "../models";

function envConfig() {
    const result: any = {};
    if (!process || !process.env) {
        return result;
    }
    const { GO3_DB_DATABASE, GO3_DB_USER, GO3_DB_PASSWORD, GO3_DB_PORT, GO3_DB_HOST, GO3_DB_LOGGING } = process.env;
    if (GO3_DB_DATABASE) { result.database = GO3_DB_DATABASE; }
    if (GO3_DB_USER) { result.username = GO3_DB_USER; }
    if (GO3_DB_PASSWORD) { result.password = GO3_DB_PASSWORD; }
    if (GO3_DB_PORT) { result.port = GO3_DB_PORT; }
    if (GO3_DB_HOST) { result.host = GO3_DB_HOST; }
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
            ...Yaml.load("./database.yml"),
            ...envConfig(),
        });
        info("Connected to database.");
    }

    @factory
    public getConnection(): Connection {
        return this.conn;
    }
}
