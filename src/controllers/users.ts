import { User, Game } from "models";
import { controller, route, is, created, body, ok, param, notFound } from "hyrest";
import { Validation } from "./validation";
import { inject, component } from "tsdi";
import bind from "bind-decorator";
import { pick } from "ramda";
import { hash } from "encrypt";
import { signup, owner, world } from "scopes";

@controller()
@component
export class Users {
    @inject private validation: Validation;

    @bind @route("POST", "/user").dump(User, owner)
    public async createUser(@body(signup) user: User) {
        await user.save();
        return ok(user);
    }

    @bind @route("GET", "/user/:id").dump(User, world)
    public async getUser(@param("id") @is() id: string) {
        const user = await User.findOneById(id);
        if (!user) { return notFound(`Could not find user with id '${id}'`); }
        return ok(user);
    }
}
