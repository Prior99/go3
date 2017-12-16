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

import { User, Game, Participant, Token, UserStats, Friendship } from "../models";
import { signup, owner, world, friendshipCreate } from "../scopes";
import { Context } from "../server/context";
import { WinLossChartDataPoint } from "../models/user-stats/win-loss-chart-data-point";

@controller @component
export class Friendships {
    @inject private db: Connection;

    @route("POST", "/friendship").dump(Friendship, owner)
    public async createFriendship(@body(friendshipCreate) friendship: Friendship, @context ctx?: Context) {
        if ((await ctx.currentUser()).id !== friendship.from.id) {
            return unauthorized<Friendship>("Cannot create friendship for other user.");
        }
        await this.db.getRepository(Friendship).save(friendship);
        return ok(friendship);
    }

    @route("GET", "/user/:id/friends").dump(Friendship, world) @noauth
    public async getFriends(@param("id") @is() id: string) {
        const user = await this.db.getRepository(User).findOne({
            where: { id },
            relations: ["friends", "friends.from", "friends.to"],
        });
        if (!user) { return notFound<User>(`Could not find user with id '${id}'`); }
        return ok(user.friends);
    }

    @route("GET", "/user/:id/friendOf").dump(Friendship, world) @noauth
    public async getFriendOf(@param("id") @is() id: string) {
        const user = await this.db.getRepository(User).findOne({
            where: { id },
            relations: ["friendOf", "friendOf.from", "friendOf.to"],
        });
        if (!user) { return notFound<User>(`Could not find user with id '${id}'`); }
        return ok(user.friendOf);
    }
}
