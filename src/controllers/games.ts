import { controller, route, created, body, unprocessableEntity, context } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import { Participant, Game, User } from "models";
import { gameCreate, owner } from "scopes";
import { Context } from "../server/context";

@controller @component
export class Games {
    @inject private db: Connection;

    @route("POST", "/game").dump(Game, owner)
    public async createGame(@body(gameCreate) game: Game, @context ctx?: Context): Promise<Game> {
        const participant1 = game.participants[0];
        const participant2 = game.participants[1];

        if (participant1.color === participant2.color) {
            return unprocessableEntity(undefined, "Colors are the same.");
        }
        if (participant1.user.id === participant2.user.id) {
            return unprocessableEntity(undefined, "Users are the same.");
        }
        const currentUser = await ctx.currentUser();
        if (currentUser.id !== participant1.user.id && currentUser.id !== participant2.user.id) {
            return unprocessableEntity(undefined, "Cannot create game for two foreign users,");
        }
        await this.db.getRepository(Participant).save(game.participants);
        await this.db.getRepository(Game).save(game);
        return created(game);
    }
}
