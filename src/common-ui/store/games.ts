import { observable, computed, action, extendObservable } from "mobx";
import { bind } from "bind-decorator";
import { History } from "history";
import { component, inject, initialize } from "tsdi";
import * as pathToRegexp from "path-to-regexp";
import { formatDistance } from "date-fns";

import { routeGame, routeGames } from "../routing/index";
import { Games, Board, Users, Game, Color, formatBoardSize } from "../../common";

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

    private refreshBoardsInterval: any;
    private refreshGamesInterval: any;
    private autoRefreshDisabled = false;

    @initialize @bind private async initialize() {
        this.browserHistory.listen(this.refreshGameId);
        await this.refreshGameId();
        await this.loadGames();
        this.refreshGamesInterval = setInterval(this.refreshGames, 10000);
    }

    @bind public disableAutoRefresh() {
        if (this.refreshBoardsInterval) {
            clearInterval(this.refreshBoardsInterval);
        }
        if (this.refreshGamesInterval) {
            clearInterval(this.refreshGamesInterval);
        }
        this.autoRefreshDisabled = true;
    }

    @bind private async refreshGameId() {
        this.currentGameId = parseGameId(this.browserHistory.location.pathname);
        if (this.currentGameId) {
            if (!this.currentGame) {
                await this.loadGame(this.currentGameId);
            }
            await this.loadBoards(this.currentGameId);
            if (!this.autoRefreshDisabled) {
                this.refreshBoardsInterval = setInterval(this.refreshBoards, 3000);
            }
        }
    }

    @bind private async refreshGames() {
        await this.loadGames();
    }

    @bind public async refreshAll() {
        await this.refreshGames();
        await this.refreshBoards();
    }

    @bind private async refreshBoards() {
        if (this.currentGame) {
            const newBoards = await this.gamesController.listBoards(this.currentGameId, this.currentGame.turn);
            newBoards.forEach(board => this.addBoard(this.currentGame, board));
            if (this.currentGame.consecutivePasses >= 2 || this.currentGame.currentBoard.resigned) {
                await this.loadGame(this.currentGameId);
                await this.loadBoards(this.currentGameId);
            }
            if (this.currentGame.over && this.refreshBoardsInterval) {
                clearInterval(this.refreshBoardsInterval);
            }
            return;
        }
        if (this.refreshBoardsInterval) {
            clearInterval(this.refreshBoardsInterval);
        }
    }

    @bind private addBoard(game: Game, board: Board) {
        if (game.boards.find(other => other.id === board.id)) {
            return;
        }
        game.boards.push(board);
    }

    @bind private async storeGame(game: Game) {
        const old = this.byId(game.id);
        if (old && old.equals(game)) {
            return;
        }
        const latestBoard = await this.gamesController.latestBoard(game.id);
        game.boards = old ? old.boards : [];
        if (!game.boards.find(board => latestBoard.id === board.id)) {
            this.addBoard(game, latestBoard);
        }
        this.games.set(game.id, game);
        await Promise.all(game.participants.map(({ user }) => this.users.load(user.id)));
    }

    @bind @action public async loadGames() {
        this.loading = true;
        if (this.login.loggedIn) {
            const games = await this.usersController.listGames(this.login.userId, true);
            await Promise.all(games.map(game => this.storeGame(game)));
        }
        this.loading = false;
    }

    @bind @action public async loadGame(id: string) {
        const game = await this.gamesController.getGame(id);
        await this.storeGame(game);
        return game;
    }

    @bind @action public async createGame(userId: string, size: number) {
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
        await this.storeGame(game);
        this.loading = false;
        return game;
    }

    @bind @action private async loadBoards(gameId: string) {
        if (!this.byId(gameId)) {
            return;
        }
        const boards = await this.gamesController.listBoards(gameId);
        this.games.get(gameId).boards = boards;
    }

    @computed
    public get all(): Game[] {
        return Array.from(this.games.values());
    }

    @bind public byId(id: string) {
        return this.games.get(id);
    }

    @bind @action public async turn(game: Game, index: number) {
        const board = await this.gamesController.turn(game.id, index);
        this.addBoard(game, board);
    }

    @bind @action public async pass(game: Game) {
        const board = await this.gamesController.pass(game.id);
        this.addBoard(game, board);
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
        if (!this.currentGameId) {
            return;
        }
        if (this.login.userId === this.currentGame.whiteUser.id) {
            return Color.WHITE;
        }
        if (this.login.userId === this.currentGame.blackUser.id) {
            return Color.BLACK;
        }
        return;
    }

    @computed
    public get possibleTurns() {
        return this.all.filter(game => game.currentUser.id === this.login.userId && !game.over);
    }

    @bind public format(game: Game) {
        const opponent = game.getOpponent(this.login.userId).name;
        const size = formatBoardSize(game.boardSize);
        const turn = game.turn;
        const created = formatDistance(game.created, new Date());
        return `Game from ${created} ago vs ${opponent} on a ${size} board at turn ${turn}`;
    }
}
