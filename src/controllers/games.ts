import { controller, route, created, body } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import { Participant, Game, User } from "models";
import { gameCreate, owner } from "scopes";

@controller()
@component
export class Games {
    @inject private db: Connection;

    @route("POST", "/game").dump(Game, owner)
    public async createGame(@body(gameCreate) game: Game): Promise<Game> {
        return created(game);
    }
}
