import { User, Token } from "models";
import { controller, route, is, created, body, ok, param, unauthorized, populate } from "hyrest";
import { Validation } from "./validation";
import { inject, component } from "tsdi";
import bind from "bind-decorator";
import { hash } from "encrypt";
import { login, owner } from "scopes";

@controller()
@component
export class Tokens {
    @bind @route("POST", "/token").dump(Token, owner)
    public async createToken(@body(login) credentials: User) {
        const user = await User.findOne({
            ...credentials,
            password: hash(credentials.password),
        });
        if (!user) {
            return unauthorized();
        }
        const newToken = populate(login, Token, { user });
        await newToken.save();
        return ok(newToken);
    }
}
