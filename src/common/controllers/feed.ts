import { controller, route, is, body, ok, noauth, dump, populate } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import { compareDesc } from "date-fns";

import { User, Game, Participant, FeedItem, FeedEvent } from "../models";
import { world } from "../scopes";
import { Context } from "../context";
import { Rank, newRating, GameResult } from "../utils";

const feedLimit = 50;

@controller @component
export class Feed {
    @inject private db: Connection;

    @route("GET", "/feed").dump(FeedItem, world) @noauth
    public async getFeed() {
        const users = await this.db.getRepository(User).createQueryBuilder("user")
            .orderBy("created", "DESC")
            .limit(feedLimit)
            .getMany();
        const games = await this.db.getRepository(Game).createQueryBuilder("game")
            .leftJoinAndSelect("game.participants", "participant")
            .leftJoinAndSelect("participant.user", "user")
            .where("participant.winner IS NOT NULL")
            .orderBy("participant.updated", "DESC")
            .limit(feedLimit)
            .getMany();
        const userJoinEvents = users.map(user => populate(world, FeedItem, {
            date: user.created,
            event: FeedEvent.NEW_USER,
            user,
        }));
        const gameOverEvents = games.map(game => populate(world, FeedItem, {
            date: game.participants[0].updated,
            event: FeedEvent.GAME_OVER,
            game,
        }));
        const rankChangeEvents = games.reduce((result, game) => {
            game.participants.forEach((participant, index) => {
                const newRank = new Rank(game.newRating(participant.user.id));
                const oldRank = new Rank(participant.rating);
                if (!newRank.equals(oldRank)) {
                    result.push(populate(world, FeedItem, {
                        date: participant.updated,
                        event: FeedEvent.RANK_CHANGE,
                        user: participant.user,
                        game,
                    }));
                }
            });
            return result;
        }, [] as FeedItem[]);
        const events = [...userJoinEvents, ...gameOverEvents, ...rankChangeEvents]
            .sort((a, b) => compareDesc(a.date, b.date))
            .filter((_, index) => index < feedLimit);
        return ok(events);
    }
}
