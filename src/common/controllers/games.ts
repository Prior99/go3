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
    DataType,
    required,
    unauthorized,
    query,
    noauth,
} from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import * as Raven from "raven";

import { Participant, Game, User, Board } from "../models";
import { gameCreate, owner, turn, world } from "../scopes";
import { Context } from "../context";
import { Color, newRating, GameResult, oppositeColor  } from "../utils";
import { PushNotifications } from "../../server/push-notifications";
import { invokeAI, Action } from "../ai";

@controller @component
export class Games {
    @inject private db: Connection;
    @inject private pushNotifications: PushNotifications;

    private async invokeAI(id: string) {
        try {
            const game = await this.db.getRepository(Game).createQueryBuilder("game")
                .leftJoinAndSelect("game.boards", "board")
                .leftJoinAndSelect("game.participants", "participant")
                .leftJoinAndSelect("participant.user", "user")
                .leftJoinAndSelect("board.game", "boardGame")
                .where("game.id=:id", { id })
                .orderBy("board.turn", "ASC")
                .getOne();
            const aiResult = await invokeAI(game);
            if (aiResult) {
                switch (aiResult.action) {
                    case Action.PASS: {
                        const newBoard = game.currentBoard.pass();
                        await this.db.getRepository(Board).save(newBoard);
                        if (game.consecutivePasses >= 1) {
                            await this.setWinner(game, newBoard.winningColor);
                        }
                        return;
                    }
                    case Action.PLACE: {
                        await this.db.getRepository(Board).save(
                            game.currentBoard.place(game.currentBoard.toIndex(aiResult.position)),
                        );
                        return;
                    }
                    case Action.RESIGN: {
                        await this.setWinner(game, oppositeColor(game.getColorForUser(game.currentUser.id)));
                        await this.db.getRepository(Board).save(game.currentBoard.resign());
                    }
                    default: return;
                }
            }
        } catch (err) {
            console.error("GTP Error:", err);
            Raven.captureException(err);
        }
    }

    @route("POST", "/game").dump(Game, world)
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

        participant1.rating = participant1.user.rating;
        participant2.rating = participant2.user.rating;

        const finalGame = await this.db.transaction(async transaction => {
            await transaction.getRepository(Participant).save(game.participants);
            await transaction.getRepository(Game).save(game);
            await transaction.getRepository(Board).save(populate(turn, Board, {
                game,
                prisonersBlack: 0,
                prisonersWhite: 0,
                state: Array.from({ length: Math.pow(game.boardSize, 2)}).map(() => Color.EMPTY),
                turn: 0,
            }));

            return game;
        });
        await this.invokeAI(finalGame.id);

        game.participants.forEach(participant => this.pushNotifications.notifyUser(participant.user.id));

        return created(finalGame);
    }

    @route("GET", "/game/:id").dump(Game, world) @noauth
    public async getGame(@param("id") @is() id: string): Promise<Game> {
        const game = await this.db.getRepository(Game).findOne({
            where: { id },
            relations: ["participants", "participants.user"],
        });
        if (!game) {
            return notFound<Game>(`Could not find game with id ${id}.`);
        }
        return ok(game);
    }

    @route("GET", "/game/:id/boards").dump(Board, world) @noauth
    public async listBoards(
        @param("id") @is() id: string,
        @query("sinceTurn") @is(DataType.int) sinceTurn = -1,
    ): Promise<Board[]> {
        const game = await this.db.getRepository(Game).createQueryBuilder("game")
            .leftJoinAndSelect("game.boards", "board", "board.turn > :sinceTurn", { sinceTurn })
            .where("game.id=:id", { id })
            .orderBy("board.turn", "DESC")
            .getOne();
        if (!game) { return notFound(undefined, `Could not find user with id '${id}'`); }
        return ok(game.boards.sort((a, b) => a.turn - b.turn));
    }

    @route("GET", "/game/:id/boards/latest").dump(Board, world) @noauth
    public async latestBoard(
        @param("id") @is() id: string,
    ): Promise<Board> {
        const board = await this.db.getRepository(Board).createQueryBuilder("board")
            .where("board.game=:id", { id })
            .orderBy("board.turn", "DESC")
            .getOne();
        if (!board) { return notFound(undefined, `Could not find latest board for game with id '${id}'`); }
        return ok(board);
    }

    @route("POST", "/game/:id/turn").dump(Board, world)
    public async turn(
        @param("id") @is() id: string,
        @body() @is(DataType.int).validate(required) index: number,
        @context ctx?: Context,
    ): Promise<Board> {
        const game = await this.db.getRepository(Game).createQueryBuilder("game")
            .leftJoinAndSelect("game.boards", "board")
            .leftJoinAndSelect("game.participants", "participant")
            .leftJoinAndSelect("participant.user", "user")
            .leftJoinAndSelect("board.game", "boardGame")
            .where("game.id=:id", { id })
            .orderBy("board.turn", "ASC")
            .getOne();

        if (!game) { return notFound<Board>(`Could not find game with id ${id}.`); }
        if (game.over) { return unprocessableEntity<Board>("The game is over."); }
        if ((await ctx.currentUser()).id !== game.currentUser.id) { return unauthorized<Board>(); }

        const message = game.turnValid(index);
        if (message) {
            return unprocessableEntity<Board>(message);
        }

        const newBoard = game.currentBoard.place(index);
        await this.db.getRepository(Board).save(newBoard);

        await this.invokeAI(game.id);

        game.participants.forEach(participant => this.pushNotifications.notifyUser(participant.user.id));

        return ok(newBoard);
    }

    @route("POST", "/game/:id/pass").dump(Board, world)
    public async pass(
        @param("id") @is() id: string,
        @context ctx?: Context,
    ): Promise<Board> {
        const game = await this.db.getRepository(Game).createQueryBuilder("game")
            .leftJoinAndSelect("game.boards", "board")
            .leftJoinAndSelect("game.participants", "participant")
            .leftJoinAndSelect("participant.user", "user")
            .leftJoinAndSelect("board.game", "boardGame")
            .where("game.id=:id", { id })
            .orderBy("board.turn", "ASC")
            .getOne();

        if (!game) { return notFound<Board>(`Could not find game with id ${id}.`); }
        if (game.over) { return unprocessableEntity<Board>("The game is over."); }
        if ((await ctx.currentUser()).id !== game.currentUser.id) { return unauthorized<Board>(); }

        const newBoard = game.currentBoard.pass();
        const finalBoard = await this.db.transaction(async transaction => {
            await transaction.getRepository(Board).save(newBoard);
            if (game.consecutivePasses >= 1) {
                await this.setWinner(game, newBoard.winningColor);
            }
            return newBoard;
        });

        await this.invokeAI(game.id);

        game.participants.forEach(participant => this.pushNotifications.notifyUser(participant.user.id));

        return ok(finalBoard);
    }

    private async setWinner(game: Game, winningColor: Color) {
        game.participants.forEach(participant => participant.winner = participant.color === winningColor);
        game.participants.forEach(participant => {
            participant.rating = participant.user.rating;
            participant.user.rating = game.newRating(participant.user.id);
        });
        await this.db.transaction(async transaction => {
            await transaction.getRepository(Participant).save(game.participants);
            await transaction.getRepository(User).save(game.participants.map(participant => participant.user));
        });
    }

    @route("POST", "/game/:id/resign").dump(Board, world)
    public async resign(
        @param("id") @is() id: string,
        @context ctx?: Context,
    ): Promise<undefined> {
        const game = await this.db.getRepository(Game).createQueryBuilder("game")
            .leftJoinAndSelect("game.participants", "participant")
            .leftJoinAndSelect("participant.user", "user")
            .where("game.id=:id", { id })
            .orderBy("board.turn", "ASC")
            .getOne();

        if (!game) { return notFound<undefined>(`Could not find game with id ${id}.`); }
        if (game.over) { return unprocessableEntity<undefined>("The game is over."); }
        if ((await ctx.currentUser()).id !== game.currentUser.id) { return unauthorized<undefined>(); }

        const winningColor = oppositeColor(game.getColorForUser(game.currentUser.id));
        await this.db.getRepository(Board).save(game.currentBoard.resign());
        await this.setWinner(game, winningColor);

        return ok();
    }
}
