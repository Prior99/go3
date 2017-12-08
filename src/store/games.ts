import { observable, computed, action } from "mobx";
import { bind } from "bind-decorator";
import { LoginStore } from ".";
import { History } from "history";
import { component, inject, initialize } from "tsdi";
import { Game } from "../models";
import { Games, Users } from "controllers";
import { Color } from "../board-color";

@component("GamesStore")
export class GamesStore {
    @inject private gamesController: Games;
    @inject private usersController: Users;
    @inject("LoginStore") private login: LoginStore;

    @observable private games: Map<string, Game> = new Map();
    @observable public loading = false;

    @initialize
    private async initialize() {
        if (this.login.loggedIn) {
            await this.loadGames();
        }
    }

    @bind @action
    public async loadGames() {
        this.loading = true;
        if (this.login.loggedIn) {
            const games = await this.usersController.listGames(this.login.userId);
            games.forEach(game => this.games.set(game.id, game));
        }
        this.loading = false;
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
        });
        this.games.set(game.id, game);
        this.loading = false;
        return game;
    }

    @computed
    public get all(): Game[] {
        return Array.from(this.games.values());
    }

    @bind
    public byId(id: string) {
        return this.games.get(id);
    }
}
