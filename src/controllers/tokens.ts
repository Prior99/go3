import { controller, route, created, body, unauthorized, populate, noauth } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";

import { login, owner } from "../scopes";
import { User, Token } from "../models";

@controller @component
export class Tokens {
    @inject public db: Connection;

    @route("POST", "/token").dump(Token, owner) @noauth
    public async createToken(@body(login) credentials: User): Promise<Token> {
        const user = await this.db.getRepository(User).findOne(credentials);
        if (!user) {
            return unauthorized();
        }
        const newToken = populate(owner, Token, { user });
        await this.db.getRepository(Token).save(newToken);
        return created(newToken);
    }
}
