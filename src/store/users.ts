import { observable, computed, action } from "mobx";
import { bind } from "bind-decorator";
import { LoginStore, OwnUserStore } from ".";
import { History } from "history";
import { component, inject } from "tsdi";
import { Users } from "controllers";
import { User } from "../models";

@component
export class UsersStore {
    @inject private usersController: Users;

    @observable private users: Map<string, User> = new Map();
    @observable public loading = false;

    @bind @action
    public async searchUsers(search: string) {
        this.loading = true;
        const users = await this.usersController.findUsers(search);
        users.forEach(user => {
            this.users.set(user.id, user);
        });
        this.loading = false;
        return users;
    }

    @computed
    public get all(): User[] {
        return Array.from(this.users.values());
    }

    @bind
    public async load(id: string) {
        const user = await this.usersController.getUser(id);
        this.users.set(user.id, user);
        return user;
    }

    @bind
    public byId(id: string) {
        return this.users.get(id);
    }
}
