import { observable, action, autorun } from "mobx";
import { component, inject, initialize } from "tsdi";
import { bind } from "bind-decorator";

import { Game, formatPosition } from "../../common";
import { drawBoard } from "..";
import { GamesStore, OwnUserStore } from ".";

@component({ eager: true })
export class NotificationsStore {
    @inject private games: GamesStore;
    @inject private ownUser: OwnUserStore;

    @observable private forbidden = false;
    @observable private lastTurns: Map<string, number> = new Map();

    @initialize
    private async init() {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            this.forbidden = true;
            return;
        }
        autorun(this.checkNotifications);
    }

    @bind private notify(game: Game) {
        const opponent = game.getOpponent(this.ownUser.user.id).name;
        const { turn } = game;
        const position = formatPosition(game.currentBoard.toPos(game.currentBoard.placedAt), game.boardSize);
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        drawBoard(canvas, game.currentBoard);
        new Notification("It's your turn", { // tslint:disable-line
            body: `${opponent} played turn ${turn} at ${position} and now it's your turn.`,
            icon: canvas.toDataURL(),
        });
    }

    @bind private checkNotifications() {
        this.games.all.forEach(game => {
            const shouldNotify = this.lastTurns.has(game.id) &&
                game.turn > this.lastTurns.get(game.id) &&
                game.currentUser.id === this.ownUser.user.id;
            if (shouldNotify) {
                this.notify(game);
            }
            this.lastTurns.set(game.id, game.turn);
        });
    }
}
