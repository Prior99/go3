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

import { User, Game, Participant, Token, UserStats, Followership } from "../models";
import { signup, owner, world, followershipCreate } from "../scopes";
import { Context } from "../server/context";
import { WinLossChartDataPoint } from "../models/user-stats/win-loss-chart-data-point";

@controller @component
export class Followerships {
    @inject private db: Connection;

    @route("DELETE", "/followership/:id")
    public async deleteFollowership(@param("id") @is() id: string, @context ctx?: Context) {
        const followership = await this.db.getRepository(Followership).findOneById(id);
        if (!followership) { return notFound(`Could not find followership with id '${id}'.`); }
        if ((await ctx.currentUser()).id !== followership.follower.id) {
            return unauthorized("Can not delete foreign followership.");
        }
        await this.db.getRepository(Followership).delete(followership);
        return ok();
    }

    @route("POST", "/followership").dump(Followership, owner)
    public async createFollowership(@body(followershipCreate) followership: Followership, @context ctx?: Context) {
        if ((await ctx.currentUser()).id !== followership.follower.id) {
            return unauthorized<Followership>("Cannot create followership for other user.");
        }
        await this.db.getRepository(Followership).save(followership);
        return ok(followership);
    }

    @route("GET", "/user/:id/following").dump(Followership, world) @noauth
    public async getFollowing(@param("id") @is() id: string) {
        const user = await this.db.getRepository(User).findOne({
            where: { id },
            relations: ["following", "following.follower", "following.followed"],
        });
        if (!user) { return notFound<Followership[]>(`Could not find user with id '${id}'`); }
        return ok(user.following);
    }

    @route("GET", "/user/:id/followers").dump(Followership, world) @noauth
    public async getFollowers(@param("id") @is() id: string) {
        const user = await this.db.getRepository(User).findOne({
            where: { id },
            relations: ["followers", "followers.follower", "followers.followed"],
        });
        if (!user) { return notFound<Followership[]>(`Could not find user with id '${id}'`); }
        return ok(user.followers);
    }
}
