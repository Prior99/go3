import { controller, route, is, created, body, ok, param, notFound, query, noauth } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";

import { User, Game, Participant, Token } from "../models";
import { signup, owner, world } from "../scopes";

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
