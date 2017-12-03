import { controller, route, is, created, body, ok, param, notFound, query } from "hyrest";
import { inject, component } from "tsdi";
import { pick } from "ramda";
import { Connection } from "typeorm";
import { User, Game } from "models";
import { Validation } from "./validation";
import { hash } from "encrypt";
import { signup, owner, world } from "scopes";

@controller()
@component
export class Users {
    @inject private db: Connection;
    @inject private validation: Validation;

    @route("POST", "/user").dump(User, owner)
    public async createUser(@body(signup) user: User) {
        await this.db.getRepository(User).save(user);
        return ok();
    }

    @route("GET", "/user/:id").dump(User, world)
    public async getUser(@param("id") @is() id: string) {
        const user = await this.db.getRepository(User).findOneById(id);
        if (!user) { return notFound(`Could not find user with id '${id}'`); }
        return ok(user);
    }

    @route("GET", "/user").dump(User, world)
    public async findUsers(@query("search") @is() search: string) {
        const users = await this.db.getRepository(User).createQueryBuilder()
            .where("name LIKE :name", { name: `%${search}%` })
            .limit(100)
            .getMany();
        console.log(users)
        return ok(users);
    }
}
