import { controller, route, is, ok, body, DataType } from "hyrest";
import { inject, component } from "tsdi";
import { Connection } from "typeorm";
import { User } from "models";

@controller()
@component
export class Validation {
    @inject public db: Connection;

    @route("POST", "/validate/user/email")
    public async emailAvailable(@body() @is(DataType.str) email: string) {
        const user = await this.db.getRepository(User).findOne({ email });
        if (user) {
            return ok({ error: "Email already taken." });
        }
        return ok({});
    }

    @route("POST", "/validate/user/name")
    public async nameAvailable(@body() @is(DataType.str) name: string) {
        const user = await this.db.getRepository(User).findOne({ name });
        if (user) {
            return ok({ error: "Name already taken." });
        }
        return ok({});
    }
}
