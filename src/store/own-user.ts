import { observable, computed, action } from "mobx";
import { bind } from "bind-decorator";
import { component, initialize, inject } from "tsdi";
import { User } from "models";
import { Users } from "controllers";
import { LoginStore } from "store";

@component
export class OwnUserStore {
    @inject private users: Users;
    @inject private login: LoginStore;

    @observable public user: User;

    @initialize @bind @action
    public async loadUser() {
        const response = await this.users.getUser(this.login.userId);
        if (response) {
            this.user = response as User;
        }
    }
}
