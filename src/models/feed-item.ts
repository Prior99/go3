import { is, DataType, scope, specify } from "hyrest";
import { computed } from "mobx";

import { world } from "../scopes";
import { User, Game } from ".";

export enum FeedEvent {
    NEW_USER = "new_user",
    GAME_OVER = "game_over",
    RANK_CHANGE = "rank_change",
}

export class FeedItem {
    @scope(world) @specify(() => Date)
    public date?: Date;

    @scope(world)
    public event?: FeedEvent;

    @scope(world)
    public user?: User;

    @scope(world)
    public game?: Game;

    @scope(world)
    public oldRating?: number;
}
