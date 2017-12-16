import { observable, computed, action } from "mobx";
import { bind } from "bind-decorator";
import { History } from "history";
import { component, inject } from "tsdi";

import { Users } from "../../controllers";

import { LoginStore, OwnUserStore } from ".";

@component
export class SignupStore {
    @inject private login: LoginStore;
    @inject private users: Users;
    @inject private ownUser: OwnUserStore;

    @observable public signupResult: Boolean;

    @bind @action
    public async signup(email: string, password: string, name: string) {
        const body = { email, password };
        const response = await this.users.createUser({ email, password, name });
        if (response) {
            await this.login.login(email, password);
            await this.ownUser.loadUser();
        }
        return response;
    }
}
