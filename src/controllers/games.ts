import { controller, route, created, body, unprocessableEntity } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import { Participant, Game, User } from "models";
import { gameCreate, owner } from "scopes";

@controller @component
export class Games {
    @inject private db: Connection;

    @route("POST", "/game").dump(Game, owner)
    public async createGame(@body(gameCreate) game: Game) {
        if (game.participants[0].color === game.participants[1].color) {
            return unprocessableEntity("Colors are the same.");
        }
        if (game.participants[0].user.id === game.participants[1].user.id) {
            return unprocessableEntity("Users are the same.");
        }
        await this.db.getRepository(Participant).save(game.participants);
        await this.db.getRepository(Game).save(game);
        return created(game);
    }
}
