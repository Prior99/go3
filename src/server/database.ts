import { component, factory, initialize } from "tsdi";
import { createConnection, Connection } from "typeorm";
import { info } from "winston";
import * as Yaml from "yamljs";
import { User, Token, Game, Board, Participant } from "models";

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
            ],
            ...Yaml.load("./database.yml"),
        });
        info("Connected to database.");
    }

    @factory
    public getConnection(): Connection {
        return this.conn;
    }
}
