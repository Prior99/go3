import { User, Token, CreateToken, dumpToken } from "models";
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
    unauthorized,
} from "hyrest";
import { Validation } from "./validation";
import { inject, component } from "tsdi";
import bind from "bind-decorator";
import { hash } from "encrypt";

interface Login {
    email: string;
    password: string;
}

@controller()
@component
export class Tokens {
    @bind
    private loginSchema() {
        return schema({
            email: is(DataType.str).validate(email, required),
            password: is(DataType.str).validate(length(8, 255), required),
        });
    }

    @bind @route("POST", "/token")
    public async createToken(
        @body() @is(DataType.obj).validateCtx(ctx => [ctx.loginSchema()]) credentials: Login,
    ): Promise<Token> {
        const user = await User.findOne({
            ...credentials,
            password: hash(credentials.password),
        });
        if (!user) {
            return unauthorized();
        }
        const newToken = new Token({ user });
        await newToken.save();
        return ok(dumpToken(newToken));
    }
}
