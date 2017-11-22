import { User, Game } from "models";
import { controller, route, is, ok, body, DataType } from "hyrest";
import { inject, component } from "tsdi";
import bind from "bind-decorator";

@controller()
@component
export class Validation {
    @bind @route("POST", "/validate/user/email")
    public async emailAvailable(@body() @is(DataType.str) email: string) {
        const user = await User.findOne({ email });
        if (user) {
            return ok({ error: "Email already taken." });
        }
        return ok({});
    }

    @bind @route("POST", "/validate/user/name")
    public async nameAvailable(@body() @is(DataType.str) name: string) {
        const user = await User.findOne({ name });
        if (user) {
            return ok({ error: "Name already taken." });
        }
        return ok({});
    }
}
