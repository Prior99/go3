import { component, initialize } from "tsdi";
import { createConnection, Connection } from "typeorm";
import { User, Token, Game, Board, Participant } from "models";
import { info } from "winston";
import * as Yaml from "yamljs";

@component({ eager: true })
export class Database {
    public conn: Connection;

    @initialize
    private async connect() {
        if (typeof window !== "undefined") {
            return;
        }

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
}
