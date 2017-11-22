import { User, Game, CreateUser, dumpUser } from "models";
import {
    controller,
    route,
    is,
    created,
    body,
    DataType,
    required,
    email,
    length,
    ok,
    schema,
    param,
    notFound,
} from "hyrest";
import { Validation } from "./validation";
import { inject, component } from "tsdi";
import bind from "bind-decorator";
import { pick } from "ramda";
import { hash } from "encrypt";

@controller()
@component
export class Users {
    @inject private validation: Validation;

    @bind
    private userSchema() {
        return schema({
            email: is(DataType.str).validate(email, this.validation.emailAvailable, required),
            password: is(DataType.str).validate(length(8, 255), required),
            name: is(DataType.str).validate(this.validation.nameAvailable, length(5, 255), required),
        });
    }

    @bind @route("POST", "/user")
    public async createUser(@body() @is(DataType.obj).validateCtx(ctx => [ctx.userSchema()]) createUser: CreateUser) {
        const newUser = new User({
            ...createUser,
            password: hash(createUser.password),
        });
        await newUser.save();
        return ok(dumpUser(newUser));
    }

    @bind @route("GET", "/user/:id")
    public async getUser(@param("id") @is(DataType.str) id: string) {
        const user = await User.findOneById(id);
        if (!user) { return notFound(`Could not find user with id '${id}'`); }
        return ok(dumpUser(user));
    }
}
