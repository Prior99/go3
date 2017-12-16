import { inject, external } from "tsdi";
import { Validation } from "controllers";
import { Request } from "express";
import { Connection } from "typeorm";

import { getAuthTokenId } from "../authorization";
import { User } from "../models";

@external
export class Context {
    @inject public validation: Validation;
    @inject private db: Connection;

    private authTokenId: string;

    constructor(req: Request) {
        const id = getAuthTokenId(req);
        this.authTokenId = id;
    }

    public async currentUser() {
        const id = this.authTokenId;
        if (!id) {
            return;
        }
        return await this.db.getRepository(User).createQueryBuilder("user")
            .innerJoin("user.tokens", "token")
            .where("token.id=:id", { id })
            .getOne();
    }
}
