import { controller, route, is, created, body, ok, param, notFound, query, noauth } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import { User, Game, Participant } from "models";
import { signup, owner, world } from "scopes";
import { Token } from "../models";

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
        if (!user) { return notFound(`Could not find user with id '${id}'`); }
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
    public async listGames(@param("id") @is() id: string) {
        const user = await this.db.getRepository(User).createQueryBuilder("user")
            .where("user.id=:id", { id })
            .innerJoinAndSelect("user.participations", "participation")
            .innerJoinAndSelect("participation.game", "game")
            .innerJoinAndSelect("game.participants", "participant")
            .innerJoinAndSelect("participant.user", "participatingUser")
            .getOne();
        if (!user) { return notFound(`Could not find user with id '${id}'`); }
        return ok(user.participations.map(({ game }) => game));
    }
}
