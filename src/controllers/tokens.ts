import { controller, route, is, created, body, ok, param, unauthorized, populate } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import { hash } from "encrypt";
import { login, owner } from "scopes";
import { User, Token } from "models";
import { Validation } from "./validation";

@controller()
@component
export class Tokens {
    @inject public db: Connection;

    @route("POST", "/token").dump(Token, owner)
    public async createToken(@body(login) credentials: User): Promise<Token> {
        const user = await this.db.getRepository(User).findOne(credentials);
        if (!user) {
            return unauthorized();
        }
        const newToken = populate(login, Token, { user: { id: user.id } });
        await this.db.getRepository(Token).save(newToken);
        return ok(newToken);
    }
}
