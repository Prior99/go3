import {
    ok,
    controller,
    route,
    created,
    body,
    unprocessableEntity,
    context,
    populate,
    param,
    is,
    notFound,
} from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import { Participant, Game, User, Board } from "../models";
import { gameCreate, owner, turn } from "scopes";
import { Context } from "../server/context";
import { Color } from "../board-color";
import { world } from "../scopes/index";
@controller @component
export class Games {
    @inject private db: Connection;

    @route("POST", "/game").dump(Game, owner)
    public async createGame(@body(gameCreate) game: Game, @context ctx?: Context): Promise<Game> {
        const participant1 = game.participants[0];
        const participant2 = game.participants[1];

        if (participant1.color === participant2.color) {
            return unprocessableEntity<Game>("Colors are the same.");
        }
        if (participant1.user.id === participant2.user.id) {
            return unprocessableEntity<Game>("Users are the same.");
        }
        const currentUser = await ctx.currentUser();
        if (currentUser.id !== participant1.user.id && currentUser.id !== participant2.user.id) {
            return unprocessableEntity<Game>("Cannot create game for two foreign users,");
        }
        await this.db.getRepository(Participant).save(game.participants);
        await this.db.getRepository(Game).save(game);
        this.db.getRepository(Board).save(populate(turn, Board, {
            game,
            prisonersBlack: 0,
            prisonersWhite: 0,
            state: Array.from({ length: Math.pow(game.boardSize, 2)}).map(() => Color.EMPTY),
            turn: 0,
        }));
        return created(game);
    }

    @route("GET", "/game/:id/boards").dump(Board, world)
    public async listBoards(@param("id") @is() id: string): Promise<Board[]> {
        const game = await this.db.getRepository(Game).createQueryBuilder("game")
            .where("game.id=:id", { id })
            .leftJoinAndSelect("game.boards", "board")
            .getOne();
        if (!game) { return notFound(undefined, `Could not find user with id '${id}'`); }
        return ok(game.boards.sort((a, b) => a.turn - b.turn));
    }
}
