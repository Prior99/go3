import {
    controller,
    route,
    is,
    created,
    body,
    ok,
    param,
    notFound,
    query,
    noauth,
    populate,
    context,
    unauthorized,
    dump,
} from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import { startOfDay, compareAsc } from "date-fns";

import { User, Game, Participant, Token, UserStats  } from "../models";
import { signup, owner, world } from "../scopes";
import { Context } from "../server/context";
import { WinLossChartDataPoint } from "../models/user-stats/win-loss-chart-data-point";

@controller @component
export class Users {
    @inject private db: Connection;

    @route("POST", "/user").dump(User, owner) @noauth
    public async createUser(@body(signup) user: User) {
        await this.db.getRepository(User).save(user);
        return ok(user);
    }

    @route("GET", "/user/:id").dump(User, world) @noauth
    public async getUser(@param("id") @is() id: string) {
        const user = await this.db.getRepository(User).findOneById(id);
        if (!user) { return notFound<User>(`Could not find user with id '${id}'`); }
        return ok(user);
    }

    @route("GET", "/user/:id/owner").dump(User, owner)
    public async getOwnUser(@param("id") @is() id: string, @context ctx?: Context) {
        const user = await this.db.getRepository(User).findOneById(id);
        if (!user) { return notFound<User>(`Could not find user with id '${id}'`); }
        if (user.id !== (await ctx.currentUser()).id) {
            return unauthorized<User>();
        }
        return ok(user);
    }

    @route("GET", "/user/:id/stats").dump(UserStats, world) @noauth
    public async getUserStats(@param("id") @is() id: string): Promise<UserStats> {
        const user = await this.db.getRepository(User).findOne({
            where: { id },
            relations: [
                "participations",
                "participations.game",
                "game.participants",
                "participants.user",
                "participations.user",
            ],
        });

        if (!user) { return notFound<UserStats>(`Could not find user with id '${id}'`); }

        const { participations } = user;
        const active = participations.reduce((count, current) => current.winner === null ? count + 1 : count , 0);
        const wins = participations.reduce((count, current) => current.winner ? count + 1 : count , 0);
        const ties = participations.reduce((count, current) => current.game.tie ? count + 1 : count , 0);
        const losses = participations.length - wins - ties;
        const friends = 0;
        const uniqueOpponents = participations.reduce((opponents, current) => {
            const { participants } = current.game;
            participants.forEach(participant => {
                const included = opponents.map(opponent => opponent.id).includes(participant.user.id);
                if (!included && participant.user.id !== user.id) {
                    opponents.push(participant.user);
                }
            });
            return opponents;
        }, [] as User[]).length;
        const dateMap = participations.reduce((map, { updated, winner, game }) => {
            const day = startOfDay(updated);
            let dataPoint = map.get(day.toUTCString());
            if (!dataPoint) {
                dataPoint = new WinLossChartDataPoint(day);
                map.set(day.toUTCString(), dataPoint);
            }
            if (winner) { dataPoint.wins++; }
            if (game.tie) { dataPoint.ties++; }
            if (!winner && game.over && !game.tie) { dataPoint.losses++; }
            return map;
        }, new Map() as Map<string, WinLossChartDataPoint>);
        const winLossChart = Array.from(dateMap.values()).sort((a, b) => compareAsc(a.date, b.date));
        const userStats = populate(world, UserStats, {
            wins, losses, ties, friends, uniqueOpponents, winLossChart, active,
        });

        return ok(userStats);
    }

    @route("GET", "/user").dump(User, world) @noauth
    public async findUsers(@query("search") @is() search: string) {
        const users = await this.db.getRepository(User).createQueryBuilder()
            .where("name LIKE :name", { name: `%${search}%` })
            .limit(100)
            .getMany();
        return ok(users);
    }

    @route("GET", "/user/:id/games").dump(Game, world) @noauth
    public async listGames(
        @param("id") @is() id: string,
        @query("onlyActive") @is() onlyActive?: boolean,
    ): Promise<Game[]> {
        let dbQuery = this.db.getRepository(User).createQueryBuilder("user")
            .where("user.id=:id", { id })
            .leftJoinAndSelect("user.participations", "participation")
            .leftJoinAndSelect("participation.game", "game")
            .leftJoinAndSelect("game.participants", "participant")
            .leftJoinAndSelect("participant.user", "participatingUser");
        if (onlyActive) {
            dbQuery.where("participant.winner IS NULL");
        }
        const user = await dbQuery.getOne();
        if (!user) { return notFound<Game[]>(`Could not find user with id '${id}'`); }
        return ok(user.participations.map(({ game }) => game));
    }
}
