import { observable, action, autorun } from "mobx";
import { component, inject, initialize } from "tsdi";
import { bind } from "decko";

import { Game, formatPosition } from "../../common";
import { drawBoard, ServiceWorkerManager } from "..";
import { GamesStore, OwnUserStore } from ".";

@component({ name: "NotificationsStore", eager: true })
export class NotificationsStore {
    @inject private games: GamesStore;
    @inject private ownUser: OwnUserStore;
    @inject("ServiceWorkerManager") private serviceWorkerManager: ServiceWorkerManager;

    @observable private forbidden = false;
    @observable private lastTurns: Map<string, number> = new Map();
    private useServiceWorker = false;

    public useServiceWorkerApi() {
        this.useServiceWorker = true;
    }

    @initialize
    private async init() {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            this.forbidden = true;
        }
        autorun(() => {
            if (this.useServiceWorker) {
                return;
            }
            this.checkNotifications();
        });
    }

    @bind private notify(game: Game) {
        const opponent = game.getOpponent(this.ownUser.user.id).name;
        const { turn } = game;
        const position = formatPosition(game.currentBoard.toPos(game.currentBoard.placedAt), game.boardSize);
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        drawBoard(canvas, game.currentBoard);
        const title = "It's your turn";
        const options = {
            body: `${opponent} played turn ${turn} at ${position} and now it's your turn.`,
            icon: canvas.toDataURL(),
        };
        if (this.useServiceWorkerApi) {
            this.serviceWorkerManager.registration.showNotification(title, {
                ...options,
                badge: "/badge.png",
                vibrate: [100, 100, 250],
                sound: "/notify.mp3",
                timestamp: game.currentBoard.created.getTime(),
                tag: game.id,
                data: game.id,
            } as any);
        } else if (!this.forbidden) {
            new Notification(title, options); // tslint:disable-line
        }
    }

    @bind public checkNotifications() {
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
