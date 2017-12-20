import {
    controller,
    route,
    is,
    created,
    body,
    ok,
    param,
    notFound,
    noauth,
    populate,
    context,
    unauthorized,
    dump,
    unprocessableEntity,
} from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";

import { User, Followership } from "../models";
import { world, followershipCreate } from "../scopes";
import { Context } from "../context";

@controller @component
export class Followerships {
    @inject private db: Connection;

    @route("DELETE", "/followership/:id")
    public async deleteFollowership(@param("id") @is() id: string, @context ctx?: Context) {
        const followership = await this.db.getRepository(Followership).findOne({
            where: { id },
            relations: ["follower"],
        });
        if (!followership) { return notFound(`Could not find followership with id '${id}'.`); }
        if ((await ctx.currentUser()).id !== followership.follower.id) {
            return unauthorized("Can not delete foreign followership.");
        }
        await this.db.getRepository(Followership).delete({ id });
        return ok();
    }

    @route("POST", "/followership").dump(Followership, world)
    public async createFollowership(@body(followershipCreate) followership: Followership, @context ctx?: Context) {
        if ((await ctx.currentUser()).id !== followership.follower.id) {
            return unauthorized<Followership>("Cannot create followership for other user.");
        }
        if (followership.follower.id === followership.followed.id) {
            return unprocessableEntity<Followership>("Cannot follow yourself.");
        }
        await this.db.getRepository(Followership).save(followership);
        return created(await this.db.getRepository(Followership).findOne({
            where: { id: followership.id },
            relations: ["follower", "followed"],
        }));
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
