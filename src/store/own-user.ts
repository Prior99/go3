import { observable, computed, action } from "mobx";
import { bind } from "bind-decorator";
import { component, initialize, inject } from "tsdi";
import { User } from "models";
import { Users } from "controllers";
import { LoginStore } from "store";

@component("OwnUserStore")
export class OwnUserStore {
    @inject private users: Users;
    @inject("LoginStore") private login: LoginStore;

    @observable public user: User;

    @initialize @bind @action
    public async loadUser() {
        if (this.login.loggedIn) {
            const response = await this.users.getUser(this.login.userId);
            if (response) {
                this.user = response as User;
            }
        }
    }
}
