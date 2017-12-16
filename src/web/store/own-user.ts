import { observable, computed, action } from "mobx";
import { bind } from "bind-decorator";
import { component, initialize, inject } from "tsdi";

import { User, UserStats } from "../../models";
import { Users } from "../../controllers";

import { LoginStore } from ".";

@component("OwnUserStore")
export class OwnUserStore {
    @inject private users: Users;
    @inject("LoginStore") private login: LoginStore;

    @observable public user: User;
    @observable public userStats: UserStats;

    @initialize @bind @action
    public async loadUser() {
        if (this.login.loggedIn) {
            this.user = await this.users.getOwnUser(this.login.userId);
            this.userStats = await this.users.getUserStats(this.login.userId);
        }
    }
}
