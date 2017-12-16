import { observable, computed, action, extendObservable } from "mobx";
import { bind } from "bind-decorator";
import { History } from "history";
import { component, inject, initialize } from "tsdi";
import * as pathToRegexp from "path-to-regexp";

import { routeGame } from "../routing/index";
import { Color } from "../board-color";
import { Game } from "../models";
import { Games, Users } from "../controllers";

import { LoginStore, UsersStore } from ".";

function parseGameId(url: string) {
    const result = pathToRegexp(routeGame.pattern).exec(url);
    if (!result) {
        return;
    }
    return result[1];
}

@component("GamesStore")
export class GamesStore {
    @inject private browserHistory: History;
    @inject private gamesController: Games;
    @inject private usersController: Users;
    @inject("LoginStore") private login: LoginStore;
    @inject private users: UsersStore;

    @observable private games: Map<string, Game> = new Map();
    @observable public loading = false;
    @observable public currentGameId: string;

    private refreshInterval: any;

    @initialize
    private async initialize() {
        if (this.login.loggedIn) {
            await this.loadGames();
        }
        this.browserHistory.listen(this.refreshGameId);
        this.refreshGameId();
    }

    @bind
    private async refreshGameId() {
        this.currentGameId = parseGameId(this.browserHistory.location.pathname);
        if (this.currentGameId) {
            if (!this.currentGame) {
                await this.loadGame(this.currentGameId);
            }
            this.loadBoards(this.currentGameId);
            this.refreshInterval = setInterval(this.refreshBoards, 1000);
        }
    }

    @bind
    private async refreshBoards() {
        if (this.currentGame) {
            const newBoards = await this.gamesController.listBoards(this.currentGameId, this.currentGame.turn);
            this.currentGame.boards.push(...newBoards);
            if (this.currentGame.consecutivePasses >= 2) {
                await this.loadGame(this.currentGameId);
                await this.loadBoards(this.currentGameId);
            }
            if (this.currentGame.over) {
                clearInterval(this.refreshInterval);
            }
            return;
        }
        clearInterval(this.refreshInterval);
    }

    @bind
    private async storeGame(game: Game) {
        this.games.set(game.id, game);
        const latestBoard = await this.gamesController.latestBoard(game.id);
        game.boards = [latestBoard];
        await Promise.all(game.participants.map(({ user }) => this.users.load(user.id)));
    }

    @bind @action
    public async loadGames() {
        this.loading = true;
        if (this.login.loggedIn) {
            const games = await this.usersController.listGames(this.login.userId);
            games.forEach(this.storeGame);
        }
        this.loading = false;
    }

    @bind @action
    public async loadGame(id: string) {
        const game = await this.gamesController.getGame(id);
        this.storeGame(game);
        return game;
    }

    @bind @action
    public async createGame(userId: string, size: number) {
        this.loading = true;
        const game = await this.gamesController.createGame({
            participants: [
                {
                    user: { id: userId },
                    color: Color.BLACK,
                },
                {
                    user: { id: this.login.userId },
                    color: Color.WHITE,
                },
            ],
            boardSize: size,
        } as Game);
        this.storeGame(game);
        this.loading = false;
        return game;
    }

    @bind @action
    private async loadBoards(gameId: string) {
        const boards = await this.gamesController.listBoards(gameId);
        this.games.get(gameId).boards = boards;
    }

    @computed
    public get all(): Game[] {
        return Array.from(this.games.values());
    }

    @bind
    public byId(id: string) {
        return this.games.get(id);
    }

    @bind @action
    public async turn(game: Game, index: number) {
        const board = await this.gamesController.turn(game.id, index);
        game.boards.push(board);
    }

    @bind @action
    public async pass(game: Game) {
        const board = await this.gamesController.pass(game.id);
        game.boards.push(board);
        if (game.consecutivePasses >= 1) {
            await this.loadGame(game.id);
            await this.loadBoards(game.id);
        }
    }

    @computed
    public get currentGame() {
        if (!this.currentGameId) {
            return;
        }
        return this.byId(this.currentGameId);
    }

    @computed
    public get ownColor() {
        if (this.login.userId === this.currentGame.whiteUser.id) {
            return Color.WHITE;
        }
        if (this.login.userId === this.currentGame.blackUser.id) {
            return Color.BLACK;
        }
        return;
    }
}
